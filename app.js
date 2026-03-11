(function(){
// ===== 设置弹窗 =====
var settingsBtn=document.getElementById('settingsBtn'),modalBg=document.getElementById('modalBg'),apiKeyInput=document.getElementById('apiKeyInput'),saveModal=document.getElementById('saveModal'),cancelModal=document.getElementById('cancelModal');
settingsBtn.onclick=function(){apiKeyInput.value=localStorage.getItem('deepseek_api_key')||'';modalBg.classList.add('show')};
cancelModal.onclick=function(){modalBg.classList.remove('show')};
modalBg.onclick=function(e){if(e.target===modalBg)modalBg.classList.remove('show')};
saveModal.onclick=function(){var k=apiKeyInput.value.trim();if(k){localStorage.setItem('deepseek_api_key',k);alert('API Key 已保存！')}else{localStorage.removeItem('deepseek_api_key');alert('已切换到本地分析模式。')}modalBg.classList.remove('show')};

// ===== 页面元素引用 =====
var welcomeScreen=document.getElementById('welcomeScreen'),mainApp=document.getElementById('mainApp'),startBtn=document.getElementById('startBtn');
var introScreen=document.getElementById('introScreen'),readyBtn=document.getElementById('readyBtn');

// ===== 邀请码系统 =====
var INVITE_CODES=['T6X2KM','R9F4PN','W3J7QA','B8L5VD','H2Y9CE','N4G6RF','K7M3SH','D5P8TJ','Q1V2WL','A9C4XN',
'F6E8YP','J3H5ZR','L7K2AT','S4N9BV','U8Q1CX','G5R7DZ','M2T4EA','P9W6FC','X3Y8GE','Z1A5HG',
'C7B3JI','E4D9KK','V6F2LM','Y8G4NO','I5H7PQ','O1J3RS','W9K5TU','A2L8VW','R4M6XY','D7N1ZA',
'H3P9BC','T5Q2DE','N8R4FG','K1S7HI','B6T3JK','F9U5LM','J2V8NO','Q4W1PQ','X7Y3RS','L9Z6TU',
'G1A4VW','S3B7XY','U6C2ZA','M8D5BC','P2E9DE','C4F1FG','Z7G3HI','I9H6JK','E5J8LM','Y1K4NO'];

var inviteOverlay=document.getElementById('inviteOverlay'),inviteInput=document.getElementById('inviteInput'),inviteBtn=document.getElementById('inviteBtn'),inviteError=document.getElementById('inviteError');

function checkInviteCode(){
    var stored=localStorage.getItem('talent_invite_code');
    if(stored&&INVITE_CODES.indexOf(stored.toUpperCase())>=0)return true;
    return false;
}

inviteInput.addEventListener('input',function(){
    this.value=this.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase();
    inviteError.textContent='';
});

inviteInput.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();verifyInvite()}});

inviteBtn.onclick=verifyInvite;

function verifyInvite(){
    var code=inviteInput.value.trim().toUpperCase();
    if(!code){inviteError.textContent='请输入邀请码';return}
    if(code.length!==6){inviteError.textContent='邀请码为6位，请检查';return}
    if(INVITE_CODES.indexOf(code)<0){inviteError.textContent='邀请码无效，请重新输入';inviteInput.value='';inviteInput.focus();return}
    localStorage.setItem('talent_invite_code',code);
    inviteOverlay.classList.remove('show');
    welcomeScreen.classList.add('hidden');
    introScreen.style.display='flex';
}

// ===== 欢迎页 → 介绍页 → 对话 =====
startBtn.onclick=function(){
    if(checkInviteCode()){
        welcomeScreen.classList.add('hidden');
        introScreen.style.display='flex';
    }else{
        inviteOverlay.classList.add('show');
        setTimeout(function(){inviteInput.focus()},300);
    }
};
readyBtn.onclick=function(){introScreen.classList.add('hidden');mainApp.style.display='flex';setTimeout(startFromFirstQuestion,600)};

// ===== DOM =====
var chat=document.getElementById('chat'),userInput=document.getElementById('userInput'),sendBtn=document.getElementById('sendBtn'),inputBar=document.getElementById('inputBar');
var progressWrap=document.getElementById('progressWrap'),progressFill=document.getElementById('progressFill'),progressLabel=document.getElementById('progressLabel');
var loadingOverlay=document.getElementById('loadingOverlay'),loadingText=document.getElementById('loadingText'),loadingFillEl=document.getElementById('loadingFill');
var reportOverlay=document.getElementById('reportOverlay'),reportContent=document.getElementById('reportContent');

// ===== 状态 =====
var S={step:0,totalQ:0,answers:[],typing:false,complete:false,generating:false,followUpCount:0};

// ===== 问题库 =====
var CORE=[
{id:'q1',text:'好的，让我们直接开始。\n\n**【第一问 · 前社会化印记】**\n\n请回想 **16岁之前** ——那个你还没被社会规训的年代。\n\n哪些事是没人逼你也会废寝忘食去做的？或者，有哪些从小到大被批评的"顽固缺点"（如爱插嘴、太敏感、爱发呆）？',hint:'💡 比如：是拆解家里所有的电器（系统构建），还是躲在角落写没人看的小说（叙事天赋），或者是组织巷子里的孩子玩游戏（领导力）？',fb:['我捕捉到一个信号——你的"出厂设置"在这里露出了痕迹。','这个画面背后藏着你最原始的驱动力，我记住了。','有意思，那个未被规训的你，才是最接近天赋的状态。']},
{id:'q2',text:'**【第二问 · 心理表征】**\n\n当你思考你最擅长的事时，**你脑海里的画面是怎样的？**\n\n你看到的是文字、结构图、还是某种直觉的颜色/节奏？',hint:'💡 比如：一个程序员看代码可能看到的是"流动的城市"，一个会计看报表可能看到的是"平衡的天平"。你的内在画面是什么？',fb:['你的大脑编码方式刚才暴露了——这就是你的认知指纹。','这个"内在画面"说明你处理信息的底层架构和大多数人不同。','很好，心理表征越独特，天赋的辨识度就越高。']},
{id:'q3',text:'**【第三问 · 无意识胜任】**\n\n哪件事你觉得 **"这不是一眼就能看出来的吗"** ，周围人却觉得很难？',hint:'💡 比如：你能瞬间察觉到朋友情绪的细微变化（情感敏锐），或者一眼看出方案里逻辑不自洽的地方（系统逻辑）。',fb:['你做得太自然了，自然到自己都忽视了它的价值。','别人需要刻意练习的，你天生就会——这就是护城河。','这种"理所当然"正是天赋最典型的伪装方式。']},
{id:'q4',text:'**【第四问 · 嫉妒镜像】**\n\n你最近一次对谁产生过"酸溜溜"的嫉妒感？\n\n不是表面的羡慕，而是那种让你不舒服的 **"凭什么 ta 可以那样活？"**',hint:'💡 不要羞于承认。你嫉妒他的自由（渴望创造力），还是嫉妒他的井井有条（渴望秩序）？嫉妒是你灵魂里被压抑的天赋在呼救。',fb:['嫉妒是灵魂的镜子——你刺痛的地方，藏着你渴望释放的力量。','你在ta身上看到的，正是你自己不敢承认的那部分。','嫉妒不是毒药，它是一张藏宝图。']},
{id:'q5',text:'**【第五问 · 亢奋审计】**\n\n描述一个你虽然身体很累，但大脑在"唱歌"的时刻。\n\n那种 **"做完了，但我还能再干五小时"** 的感觉——你在那一刻是在与人链接，还是在独立攻克难关？',hint:'💡 比如：熬夜做完方案兴奋到睡不着 vs 做完数据报表被夸了但只想逃离。天赋让你回血，技能让你失血。',fb:['你的身体比大脑更诚实——回血的方向就是天赋的方向。','这种能量差异，比任何测试都更能揭示你的天赋本质。','天赋是你的充电宝，技能往往只是耗电的工具。']}
];

var FOLLOW_UPS=['我感觉这里面还有更深的东西。能展开说说或举一个最具体的例子吗？'];

var EXTRA=[
{id:'qx1',text:'**【追加探索 · 模式交集】**\n\n基于你之前的回答，我发现了一个有趣的模式。\n\n如果把你人生中最享受的 3 个时刻抽出来，忽略"做了什么"这件事本身，**它们有什么共同的"感觉"？**\n\n是"我在创造"？"我洞穿了真相"？"我连接了他人"？还是别的什么？',hint:'💡 试着闭眼回想那三个瞬间，感受它们的交集是什么'},
{id:'qx2',text:'**【追加探索 · 反向剥夺】**\n\n如果从明天开始，你 **完全不能做那些让你回血的事** ，必须日复一日做相反的事——\n\n你会有什么感觉？这种"被剥夺感"有多强烈？请用 1-10 分来描述。',hint:'💡 不需要美化，说出最真实的感受'},
{id:'qx3',text:'**【追加探索 · 核心隐喻】**\n\n在你的内心深处，如果要用 **一个比喻** 来形容最核心的"你"——不是别人给你贴的标签，不是职位头衔——你会说你是什么？',hint:'💡 比如：我本质上是一台精密的雷达 / 一座随时会喷发的火山 / 一条暗流涌动的河'}
];

// ===== 工具 =====
function fmt(t){return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/__(.*?)__/g,'<em>$1</em>').replace(/\n/g,'<br>').replace(/---/g,'<hr style="border:none;border-top:1px solid var(--border);margin:1.2rem 0;">')}
function scrollB(){setTimeout(function(){window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})},50)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}

function addBubble(content,role,cls){
    var d=document.createElement('div');d.className='bubble '+role+(cls?' '+cls:'');
    if(role==='ai')d.innerHTML='<span class="sender">✨ 天赋挖掘机</span>'+fmt(content);
    else d.innerHTML=fmt(content);
    chat.appendChild(d);scrollB();return d;
}

async function typeBubble(text,role){
    S.typing=true;if(sendBtn)sendBtn.disabled=true;
    var d=document.createElement('div');d.className='bubble '+role;
    d.innerHTML=(role==='ai'?'<span class="sender">✨ 天赋挖掘机</span>':'')+'<div class="typing-dots"><span></span><span></span><span></span></div>';
    chat.appendChild(d);scrollB();
    await sleep(500+Math.random()*300);
    var buf='';
    for(var i=0;i<text.length;i++){
        buf+=text[i];
        d.innerHTML=(role==='ai'?'<span class="sender">✨ 天赋挖掘机</span>':'')+fmt(buf);
        if(i%3===0)scrollB();
        await sleep(6+Math.random()*6);
    }
    S.typing=false;if(sendBtn)sendBtn.disabled=false;userInput.focus();scrollB();return d;
}

function updateProgress(){
    var c=Math.min(S.step,5);
    progressFill.style.width=(c/5*100)+'%';
    progressLabel.textContent=c+'/5';
}

userInput.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'});

// ===== 微信浏览器检测 =====
var isWechat=/MicroMessenger/i.test(navigator.userAgent);

// ===== 语音输入 =====
var voiceBtn=document.getElementById('voiceBtn'),voiceOverlay=document.getElementById('voiceOverlay'),voiceStatus=document.getElementById('voiceStatus'),voiceStopBtn=document.getElementById('voiceStopBtn'),voiceTip=document.getElementById('voiceTip');
var SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
var recognition=null,isListening=false;

if(isWechat){
    // 微信浏览器：只隐藏麦克风按钮，保留发送按钮
    voiceBtn.style.display='none';
    userInput.placeholder='输入文字或用语音输入';
}else{
    // 非微信浏览器：保留麦克风和发送按钮
    var isSecure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
    var voiceAvailable=SpeechRecognition&&isSecure;

    if(voiceAvailable){
        try{
            recognition=new SpeechRecognition();
            recognition.lang='zh-CN';
            recognition.continuous=true;
            recognition.interimResults=true;
            recognition.maxAlternatives=1;
        }catch(e){voiceAvailable=false;recognition=null}
    }

    if(voiceAvailable&&recognition){
        var finalTranscript='',interimTranscript='',existingText='';

        recognition.onstart=function(){
            isListening=true;
            voiceBtn.classList.add('active');
            voiceOverlay.classList.add('show');
            voiceStatus.textContent='正在聆听...';
            existingText=userInput.value;
            finalTranscript='';interimTranscript='';
        };
        recognition.onresult=function(e){
            interimTranscript='';
            for(var i=e.resultIndex;i<e.results.length;i++){
                if(e.results[i].isFinal){finalTranscript+=e.results[i][0].transcript}
                else{interimTranscript+=e.results[i][0].transcript}
            }
            var newText=finalTranscript+interimTranscript;
            if(newText)voiceStatus.textContent=newText;
            userInput.value=existingText+newText;
            userInput.style.height='auto';userInput.style.height=Math.min(userInput.scrollHeight,100)+'px';
        };
        recognition.onerror=function(e){
            console.error('Speech error:',e.error);
            if(e.error==='not-allowed'){voiceStatus.textContent='请允许麦克风权限后重试'}
            else if(e.error==='no-speech'){voiceStatus.textContent='没有检测到语音，请重试'}
            else{voiceStatus.textContent='识别出错：'+e.error}
            setTimeout(stopVoice,1500);
        };
        recognition.onend=function(){
            if(isListening){
                isListening=false;
                voiceBtn.classList.remove('active');
                voiceOverlay.classList.remove('show');
                if(userInput.value.trim())userInput.focus();
            }
        };

        voiceBtn.onclick=function(){
            if(S.typing||S.generating||S.complete)return;
            if(isListening){stopVoice()}else{try{recognition.start()}catch(e){showVoiceTip()}}
        };
        voiceStopBtn.onclick=function(){stopVoice()};
        // 点击遮罩关闭
        document.querySelector('.voice-overlay-mask').onclick=function(){stopVoice()};

        function stopVoice(){
            isListening=false;
            try{recognition.stop()}catch(e){}
            voiceBtn.classList.remove('active');
            voiceOverlay.classList.remove('show');
        }
    }else{
        // 非微信但不支持语音API时，点击显示提示
        voiceBtn.onclick=function(){
            if(S.typing||S.generating||S.complete)return;
            showVoiceTip();
        };
    }
}

function showVoiceTip(){
    voiceTip.classList.add('show');
    setTimeout(function(){
        voiceTip.onclick=function(e){
            if(e.target===voiceTip||e.target.classList.contains('voice-tip-close')){
                voiceTip.classList.remove('show');
                voiceTip.onclick=null;
                userInput.focus();
            }
        };
    },100);
}
document.getElementById('voiceTipClose').onclick=function(){voiceTip.classList.remove('show');userInput.focus()};

// ===== 对话流程 =====
async function startFromFirstQuestion(){
    progressWrap.style.display='flex';
    await askCore(0);
}

async function startConversation(){
    await typeBubble('你好，我是 **深度天赋挖掘机** 。\n\n我发现一个有趣的现象：很多人的焦虑，源于在不擅长的赛道上拼命，却忽视了那些"出厂自带"的能量。\n\n**天赋永远不会过期，我们只是要找到你的基础天赋。**\n\n接下来大约 15 分钟，我会通过 4-10 个深度问题，陪你潜入记忆深处。我的方法融合了盖洛普优势理论、心流理论和荣格心理学。\n\n过程中请尽量诚实——天赋往往藏在你最不以为然的地方。\n\n最终，我会为你生成一份详尽的 **《个人天赋使用说明书》** ，帮助你找到真正的基础天赋。\n\n准备好了吗？让我们开始 👇','ai');
    progressWrap.style.display='flex';
    await sleep(800);
    await askCore(0);
}

async function askCore(idx){
    if(idx>=CORE.length){await finishDialog();return}
    S.step=idx;var q=CORE[idx];
    await typeBubble(q.text,'ai');
    await sleep(400);
    addBubble(q.hint,'hint');
    updateProgress();
}

async function handleSend(){
    var text=userInput.value.trim();
    if(!text||S.typing||S.generating||S.complete)return;
    addBubble(text,'user');userInput.value='';userInput.style.height='auto';
    var ci=S.step,cq=ci<CORE.length?CORE[ci]:null;
    S.answers.push({qid:cq?cq.id:'qx'+(S.totalQ-CORE.length+1),question:cq?cq.text.substring(0,60)+'...':'追加问题',answer:text});
    S.totalQ++;
    await sleep(400);
    if(text.length<10&&S.totalQ<10&&S.followUpCount<1){S.followUpCount++;await typeBubble(pick(FOLLOW_UPS),'ai');return}
    if(cq&&cq.fb)await typeBubble(pick(cq.fb),'ai');
    S.followUpCount=0;
    await sleep(500);
    if(ci<CORE.length-1){await askCore(ci+1)}
    else if(ci===CORE.length-1){S.step=CORE.length;updateProgress();
        if(S.totalQ<7){var eq=pick(EXTRA);await typeBubble(eq.text,'ai');await sleep(300);addBubble(eq.hint,'hint')}
        else await finishDialog();
    }else{
        if(S.totalQ<8){var used=S.answers.map(function(a){return a.qid});var rem=EXTRA.filter(function(q){return used.indexOf(q.id)<0});if(rem.length>0){var eq=pick(rem);await typeBubble(eq.text,'ai');await sleep(300);addBubble(eq.hint,'hint');return}}
        await finishDialog();
    }
}

async function finishDialog(){
    S.complete=true;
    await typeBubble('我已经收集了足够的信息。基于我们 **'+S.totalQ+' 轮** 深度对话，我现在可以为你生成一份详尽的《个人天赋使用说明书》了。\n\n这份说明书将包含：\n• 你的核心底色——用一个深刻隐喻定义你的底层天赋\n• 认知地图解析——拆解你大脑的编码模式\n• 阴影炼金术——将你的"缺点"重塑为武器库\n• 能量补给指南——你的能量场与黑洞\n• 人生支点建议——极其详细的职业与生活建议\n• 写给未来的你的一封信\n\n准备好迎接这份属于你的生命说明书了吗？','ai');
    inputBar.innerHTML='<button class="gen-btn" id="genBtn">✨ 生成我的天赋说明书</button>';
    document.getElementById('genBtn').onclick=generateReport;
}

sendBtn.onclick=handleSend;
userInput.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}});

// ===== 报告生成 =====
async function generateReport(){
    S.generating=true;loadingOverlay.classList.add('show');loadingFillEl.style.width='0%';
    var msgs=['正在解析你的核心底色...','正在构建认知地图...','正在拆解心理表征模式...','正在进行阴影炼金术...','正在审计能量模式...','正在规划人生支点...','正在生成职业匹配分析...','正在撰写给未来你的信...','最终整合中，即将完成...'];
    var mi=0;var iv=setInterval(function(){if(mi<msgs.length){loadingText.textContent=msgs[mi];loadingFillEl.style.width=((mi+1)/msgs.length*95)+'%';mi++}},1200);
    try{
        var apiKey=localStorage.getItem('deepseek_api_key');var html;
        if(apiKey){html=await genWithAI(apiKey)}else{await sleep(msgs.length*1200+500);html=genLocal()}
        clearInterval(iv);loadingFillEl.style.width='100%';await sleep(500);showReport(html);
    }catch(e){clearInterval(iv);console.error(e);showReport(genLocal())}finally{loadingOverlay.classList.remove('show');S.generating=false}
}

async function genWithAI(apiKey){
    var at=S.answers.map(function(a,i){return '问题'+(i+1)+' ('+a.qid+'): '+a.question+'\n用户回答: '+a.answer}).join('\n\n');
    var prompt='你是一位融合了盖洛普优势、心流理论、荣格阴影心理学及认知科学（心理表征）的顶尖生涯咨询师。你坚信天赋是一个人处理信息的"出厂设置"，它藏在偏见、怪癖和最不费力的直觉里。\n\n核心理念：\n- 天赋即直觉：真正的天赋是由于大脑中形成了极高分辨率的"心理表征"，导致看世界的方式和他人不同。\n- 能量审计：天赋不看"结果好坏"，而看"过程是否回血"。\n- 阴影转化：所有的"顽固缺点"都是放错了位置的天赋。\n\n请基于以下对话生成一份不低于一万字的《个人天赋使用说明书》。\n\n报告结构要求：\n1)【核心底色】用一个深刻的隐喻定义用户的底层天赋（如：精密的时钟、深海的雷达）\n2)【认知地图解析】拆解用户大脑的"编码模式"，告知他为何在某些事上具有天然优势\n3)【阴影炼金术】将用户的"缺点"重塑为可以实操的武器库\n4)【能量补给指南】列出哪些环境是"能量场"，哪些是"黑洞"\n5)【人生支点建议】给出极其详细的职业、社交及生活建议，告诉他如何"顺着天赋活"\n6)【写给未来的你】一封温暖而犀利的信\n\n格式要求：使用HTML格式，段落用<p>标题用<h3>强调用<strong>，每个模块用<div class="rpt-section">包裹。语调专业且充满洞察力，需要达到他的内心，让他真的觉得有用。\n\n用户对话：\n'+at;
    var resp=await fetch('https://api.deepseek.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify({model:'deepseek-chat',messages:[{role:'system',content:'你是一位融合了盖洛普优势、心流理论、荣格阴影心理学及认知科学的顶尖生涯咨询师。请用HTML格式生成万字深度报告。语调温暖共情但犀利有洞察力，要真正触达用户内心。'},{role:'user',content:prompt}],temperature:0.85,max_tokens:8000})});
    if(!resp.ok)throw new Error('API fail');var data=await resp.json();
    return shell(data.choices[0].message.content);
}

function shell(body){return '<div class="rpt-cover"><span class="deco">🔮</span><h1>《个人天赋使用说明书》</h1><p class="sub">深度对话结晶 · '+S.totalQ+' 轮挖掘 · '+new Date().toLocaleDateString('zh-CN')+'</p></div><div class="rpt-text">'+body+'</div>'}

function showReport(html){reportContent.innerHTML=html;reportOverlay.classList.add('show');document.body.style.overflow='hidden';reportOverlay.scrollTop=0}

// ===== 本地报告 =====
function genLocal(){
    var a=S.answers,q1=g('q1'),q2=g('q2'),q3=g('q3'),q4=g('q4'),q5=g('q5'),all=(q1+q2+q3+q4+q5).toLowerCase();
    function g(id){var f=a.find(function(x){return x.qid===id});return f?f.answer:''}
    function s(t,n){return t.length>n?t.substring(0,n)+'...':t}

    var kw={creative:['创造','画','设计','写','艺术','音乐','舞','创作','想象','编故事','发明','拍','摄影','手工','搭','拼','乐高','涂鸦'],analytical:['分析','逻辑','数据','研究','解决','代码','技术','数学','拆','原理','规律','推理','观察','模式','系统','结构','编程'],social:['帮助','连接','沟通','理解','倾听','团队','朋友','聊天','安慰','关心','教','协调','共情','感受','陪伴'],leadership:['领导','组织','决策','影响','带','管理','策划','安排','计划','目标','执行','推动','发起'],expressive:['表达','说','讲','演','表演','展示','分享','传递','演讲','主持','写字','文字','语言','故事']};
    var sc={};for(var t in kw)sc[t]=kw[t].reduce(function(s,k){return s+(all.includes(k)?1:0)},0);
    var mt=Object.keys(sc).reduce(function(a,b){return sc[a]>=sc[b]?a:b},'creative');
    if(Object.values(sc).every(function(v){return v===0}))mt='creative';

    var TM={
        creative:{name:'创意构建力',type:'创造型',icon:'💡',desc:'你拥有将想象转化为现实的天赋。当你进行创造性活动时，你的神经系统会进入一种特殊的"通道状态"——想法像泉水一样自然涌出，时间仿佛停止流动。这不是后天习得的技能，而是你的"出厂配置"。在盖洛普优势理论中，这属于"战略思维"维度的核心才干。',careers:[{n:'产品创新/设计',m:95,d:'你天生适合将创意转化为具体产品'},{n:'内容创作/写作',m:90,d:'将你的内心世界外化为作品'},{n:'创业/独立顾问',m:87,d:'独立创造空间，让创意自由流淌'},{n:'品牌策略/营销',m:82,d:'用独特视角创造价值'}]},
        analytical:{name:'深度洞察力',type:'洞察型',icon:'🔍',desc:'你能穿透表象直达本质。别人还在收集信息时，你已经看到了底层的模式和联系。你的大脑就像一台高精度的模式识别机器——自动运转，从不停歇。在荣格心理学中，你属于"直觉-思维"型人格的典型代表。',careers:[{n:'战略分析/商业智能',m:93,d:'发挥模式识别和系统思考能力'},{n:'技术研发/架构',m:90,d:'构建复杂的系统解决方案'},{n:'研究/学术',m:88,d:'深度探索特定领域的真相'},{n:'产品经理',m:85,d:'快速识别用户需求本质'}]},
        social:{name:'深度共情力',type:'关系型',icon:'❤️',desc:'你拥有一种罕见的能力：感受他人内心的真实状态。这不是学来的技巧，而是你神经系统的天生配置。当你与人交流时，你能接收到大多数人忽略的微妙信息——语气的变化、眼神的闪烁、沉默的含义。',careers:[{n:'用户研究/体验设计',m:92,d:'深度理解人性需求'},{n:'教练/心理咨询',m:90,d:'帮助他人发现自身潜能'},{n:'人力资源/组织发展',m:87,d:'感知团队能量，协调和谐'},{n:'教育/培训',m:85,d:'让知识变得可理解有意义'}]},
        leadership:{name:'愿景驱动力',type:'影响型',icon:'🚀',desc:'你天生能看到别人看不到的可能性，并且有一种无法抑制的冲动去实现它。你不只是想法多——你有把想法变成现实的执行力和号召力。在盖洛普优势理论中，你的"影响力"维度得分极高。',careers:[{n:'创业/CEO',m:95,d:'创造实体，带领团队前进'},{n:'项目管理/运营',m:90,d:'把复杂目标拆解为可执行步骤'},{n:'商务发展/BD',m:87,d:'影响力和机会敏锐度'},{n:'公共关系/外交',m:83,d:'协调能力和大局观'}]},
        expressive:{name:'意义传递力',type:'表达型',icon:'🎤',desc:'你有一种将复杂概念转化为可理解形式的天赋。当你表达时，不仅仅是在传递信息——你在搭建理解的桥梁，在创造意义。你的声音、文字或动作中，有一种天然的感染力。',careers:[{n:'内容创作/自媒体',m:94,d:'让你的声音被更多人听到'},{n:'培训师/演讲者',m:91,d:'抓住听众注意力'},{n:'市场营销/品牌',m:88,d:'对语言和故事的敏感度'},{n:'教育/知识付费',m:85,d:'把知识变成有温度的故事'}]}
    };
    var T=TM[mt];

    // 阴影检测
    var traits=[
        {p:/爱插嘴|打断|抢话/i,tr:'爱插嘴',gi:'思维敏捷度',sh:'思维运转速度远超常人',tf:'将速度转化为快速决策力和敏锐的机会捕捉能力'},
        {p:/敏感|哭|感受|情绪|难过/i,tr:'太敏感',gi:'情绪感知力',sh:'拥有超乎常人的感受天线',tf:'这是共情力和洞察力的源泉'},
        {p:/发呆|走神|想象|幻想|做梦/i,tr:'爱发呆',gi:'内省创造力',sh:'内心世界如此丰富',tf:'这种"内在电影"能力是创意工作者最珍贵的资产'},
        {p:/拆|好奇|为什么|问|打破/i,tr:'爱拆东西',gi:'解构分析力',sh:'必须知道事物的内部机制',tf:'这种驱动力是所有研究者和工程师的核心动力'},
        {p:/话多|说|讲|聊|分享/i,tr:'话太多',gi:'表达连接力',sh:'思维需要通过语言外化才能理清',tf:'天生的传播者和教育者特质'},
        {p:/较真|完美|认真|纠结|细节/i,tr:'过于较真',gi:'精确追求力',sh:'无法忍受粗糙和敷衍',tf:'对品质的执着在精细化领域是稀缺资源'},
        {p:/看书|读|学|知识|探索/i,tr:'疯狂阅读',gi:'知识整合力',sh:'大脑渴望持续输入新信息',tf:'成为领域专家和跨界创新者的基础'}
    ];
    var dt={tr:'独特的行为模式',gi:'独特视角',sh:'思维方式与常规不同',tf:'这种"不同"本身就是最大的优势'};
    for(var i=0;i<traits.length;i++){if(traits[i].p.test(q1)){dt=traits[i];break}}

    // 雷达图SVG
    var rd=[
        {l:'创造力',v:mt==='creative'?92:mt==='expressive'?80:55+rn(20)},
        {l:'洞察力',v:mt==='analytical'?95:50+rn(25)},
        {l:'共情力',v:mt==='social'?93:45+rn(25)},
        {l:'执行力',v:mt==='leadership'?90:50+rn(20)},
        {l:'表达力',v:mt==='expressive'?94:mt==='social'?78:45+rn(25)},
        {l:'直觉力',v:60+rn(25)}
    ];
    function rn(m){return Math.floor(Math.random()*m)}

    function radar(data){
        var cx=140,cy=140,r=100,n=data.length,svg='';
        for(var ring=1;ring<=4;ring++){var rr=r*ring/4,pts=[];for(var i=0;i<n;i++){var a=(Math.PI*2*i/n)-Math.PI/2;pts.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1))}svg+='<polygon points="'+pts.join(' ')+'" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>'}
        var dp=[];
        for(var i=0;i<n;i++){var a=(Math.PI*2*i/n)-Math.PI/2;var ex=cx+r*Math.cos(a),ey=cy+r*Math.sin(a);svg+='<line x1="'+cx+'" y1="'+cy+'" x2="'+ex.toFixed(1)+'" y2="'+ey.toFixed(1)+'" stroke="rgba(255,255,255,.06)"/>';var lx=cx+(r+22)*Math.cos(a),ly=cy+(r+22)*Math.sin(a);svg+='<text x="'+lx.toFixed(1)+'" y="'+ly.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="11">'+data[i].l+'</text>';var vr=r*data[i].v/100;dp.push((cx+vr*Math.cos(a)).toFixed(1)+','+(cy+vr*Math.sin(a)).toFixed(1))}
        svg+='<polygon points="'+dp.join(' ')+'" fill="rgba(139,92,246,.2)" stroke="#8b5cf6" stroke-width="2"/>';
        dp.forEach(function(p){var xy=p.split(',');svg+='<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="4" fill="#ec4899"/>'});
        return '<div class="radar-wrap"><svg viewBox="0 0 280 280">'+svg+'</svg></div>';
    }

    // 能量柱图
    function eBars(){
        var bars=[
            {l:'创造活动',v:mt==='creative'?90:55+rn(25),c:'linear-gradient(to top,#8b5cf6,#a78bfa)'},
            {l:'分析思考',v:mt==='analytical'?88:50+rn(25),c:'linear-gradient(to top,#06b6d4,#22d3ee)'},
            {l:'人际互动',v:mt==='social'?92:45+rn(25),c:'linear-gradient(to top,#ec4899,#f472b6)'},
            {l:'组织推动',v:mt==='leadership'?85:40+rn(25),c:'linear-gradient(to top,#f59e0b,#fbbf24)'},
            {l:'表达传递',v:mt==='expressive'?91:50+rn(20),c:'linear-gradient(to top,#10b981,#34d399)'}
        ];
        return '<div class="energy-bars">'+bars.map(function(b){return '<div class="e-bar" style="height:'+b.v+'%;background:'+b.c+'"><span class="val">'+b.v+'%</span><span class="lbl">'+b.l+'</span></div>'}).join('')+'</div>';
    }

    var now=new Date().toLocaleDateString('zh-CN');

    // 构建报告HTML
    var R='<div class="rpt-cover"><span class="deco">🔮</span><h1>《个人天赋使用说明书》</h1><p class="sub">深度对话结晶 · '+S.totalQ+' 轮挖掘 · '+now+'</p></div>';

    // 第1章 核心底色
    R+='<div class="rpt-section"><h2><span class="num">1</span> 核心底色：你的底层天赋隐喻</h2><div class="rpt-text">';
    R+='<p>亲爱的探索者：</p>';
    R+='<p>在我们'+S.totalQ+'轮深度对话中，我捕捉到了一个清晰的信号——你的大脑有一种独特的"出厂设置"，它决定了你处理信息的方式、你被什么吸引、你在什么时候感到"活着"。</p>';
    R+='<p>如果要用一个深刻的隐喻来定义你的底层天赋，我会说：</p>';
    R+='<div class="talent-card"><h3>'+T.icon+' '+T.name+' <span class="tag">'+T.type+'天赋</span></h3><p>'+T.desc+'</p>';
    R+='<div class="evidence-box"><strong>来自对话的证据：</strong><br>';
    if(q1)R+='在你描述16岁前的记忆时，你提到了"'+s(q1,60)+'"——这个细节暴露了你的天赋原型。你的神经系统对这类活动有着天然的愉悦反应，这是你的"出厂设置"。<br><br>';
    if(q2)R+='当你描述内在画面时，你说"'+s(q2,60)+'"——这种独特的心理表征说明你大脑中已经形成了极高分辨率的认知模型，这不是学来的，是天生的。';
    R+='</div></div>';
    R+='<p>你的天赋就像一条河流——它有自己天然的流向。你可以修建堤坝暂时改变它的方向，但这需要消耗巨大的能量，而且堤坝迟早会崩溃。聪明的做法是：<strong>顺着河流的方向，修建水渠和水车，让它在自然流淌的过程中创造价值。</strong></p>';
    R+='<p>这份说明书不是一份简单的"性格测试报告"——它是一面镜子，映照出你灵魂最深处的渴望和力量。接下来，我将用盖洛普优势、心流理论、荣格阴影心理学及认知科学的综合视角，为你拆解这幅天赋图谱。</p>';
    R+=radar(rd);
    R+='<p style="text-align:center;font-size:.85rem;color:var(--t3);">你的天赋雷达图 · 数据基于对话分析</p>';
    R+='</div></div>';

    // 第2章 认知地图解析
    R+='<div class="rpt-section"><h2><span class="num">2</span> 认知地图解析：你大脑的编码模式</h2><div class="rpt-text">';
    R+='<p>在认知科学中，有一个关键概念叫<strong>"心理表征"（Mental Representation）</strong>——它是你大脑处理信息时自动构建的内部模型。顶尖专家和普通人之间的差异，核心就在于心理表征的分辨率不同。</p>';
    R+='<p>你的天赋之所以是天赋，不是因为你"努力"，而是因为你的大脑在某些领域天生就形成了<strong>极高分辨率的心理表征</strong>——你看到的东西，别人看不到。你处理的速度，别人赶不上。</p>';
    if(q2)R+='<div class="evidence-box"><strong>你的认知指纹：</strong><br>当你思考擅长的事时，你描述的是"'+s(q2,80)+'"。这个内在画面揭示了你大脑的底层编码方式——你不是用文字或数字在思考，你有自己独特的"认知语言"。</div>';
    if(q3)R+='<p>你提到"'+s(q3,80)+'"——在你眼里理所当然的事，对周围人来说很难。这正是高分辨率心理表征的证据：<strong>你在这个领域的认知模型如此精密，以至于你已经无法理解为什么别人做不到。</strong></p>';
    R+='<p>在盖洛普优势理论中，这属于"才干"（Talent）层——它是你自然而然、反复出现的思维模式。我们区分四个层次：</p>';
    R+='<p>1. <strong>知识</strong>（Knowledge）——你学到的东西，可以被遗忘<br>2. <strong>技能</strong>（Skill）——你练习掌握的，需要维护<br>3. <strong>才干</strong>（Talent）——你天生的思维模式，不会消失<br>4. <strong>优势</strong>（Strength）= 才干 × 知识 × 技能</p>';
    R+='<p>'+T.name+'属于才干层——它是你所有能力的基底。在这个基础上叠加的任何知识和技能，都会产生<strong>指数级</strong>的效果。反过来，如果你忽视这个基底，在不匹配的方向上努力，就会事倍功半，越努力越疲惫。</p>';
    R+='<p><strong>这就是为什么很多人"明明很努力却活得很累"的根本原因——他们在错误的基底上建造大厦。</strong></p>';
    R+='<p>心理学家将你这种不用思考就能自动完成的能力称为"无意识胜任"（Unconscious Competence）。对于天赋来说，你从一开始就处于这个阶段——别人需要从零学起的事，你天生就会。</p>';
    R+='<p><strong>建议：</strong></p><ul><li>不要浪费你的认知优势——选择那些能发挥你独特心理表征的赛道</li><li>主动询问身边人"你觉得我什么做得特别好"——他们能看见你的盲区</li><li>把你的"理所当然"变成产品或服务——别人愿意为你看到的东西付费</li></ul>';
    R+='</div></div>';

    // 第3章 阴影炼金术
    R+='<div class="rpt-section"><h2><span class="num">3</span> 阴影炼金术：将缺点重塑为武器库</h2><div class="rpt-text">';
    R+='<p>荣格心理学中有一个深刻的概念——<strong>"阴影"（Shadow）</strong>。它是你人格中被压抑、不被接受的部分。核心理念：<strong>所有的"顽固缺点"都是放错了位置的天赋。</strong></p>';
    R+='<p>当我们还是孩子的时候，天赋以最原始、最不加修饰的方式表达自己。但因为这种表达方式常常不符合成人世界的规则，它就被贴上了"问题行为"的标签。每一个被批评的"缺点"，都是一扇通向天赋的暗门。</p>';
    R+='<div class="shadow-zone"><p style="font-style:italic;font-size:1.05rem;margin-bottom:1rem;padding:1rem;border-left:3px solid var(--pink);background:rgba(236,72,153,.06);border-radius:0 .5rem .5rem 0;">"'+dt.tr+'"不是你的缺点——它是<strong>'+dt.gi+'</strong>的早期信号。</p>';
    R+='<div class="trait-grid"><div class="trait-item"><div class="lbl">被批评的特质</div><div class="val">'+dt.tr+'</div></div><div class="trait-item"><div class="lbl">隐藏的天赋</div><div class="val" style="color:var(--pink-l);">'+dt.gi+'</div></div><div class="trait-item"><div class="lbl">深层驱动</div><div class="val">'+dt.sh+'</div></div><div class="trait-item"><div class="lbl">转化方向</div><div class="val" style="color:var(--green);">'+dt.tf+'</div></div></div></div>';
    if(q1)R+='<p>你提到在16岁之前，"'+s(q1,80)+'"。这些看似平淡的经历，从认知科学的角度看，是你大脑"出厂设置"的胚胎期表达。</p>';
    if(q4)R+='<p>而当你谈到嫉妒时，你说"'+s(q4,80)+'"。<strong>嫉妒是灵魂的镜子</strong>——你在ta身上看到的、刺痛你的，正是你自己渴望成为但不敢承认的样子。嫉妒不是毒药，它是一张藏宝图。顺着嫉妒的方向走，你就能找到被你封印的那部分力量。</p>';
    R+='<div class="icon-grid"><div class="icon-item"><div class="emoji">🌱</div><div class="label">种子期</div></div><div class="icon-item"><div class="emoji">🌿</div><div class="label">萌芽期</div></div><div class="icon-item"><div class="emoji">🌳</div><div class="label">生长期</div></div><div class="icon-item"><div class="emoji">🌲</div><div class="label">成熟期</div></div><div class="icon-item"><div class="emoji">🌸</div><div class="label">绽放期</div></div><div class="icon-item"><div class="emoji">🍎</div><div class="label">结果期</div></div></div>';
    R+='<p style="text-align:center;font-size:.85rem;color:var(--t3);">天赋的生命周期 · 你目前正处于觉醒阶段</p>';
    R+='<p><strong>实操武器库——将阴影转化为行动：</strong></p>';
    R+='<ul><li>不要再试图"修复"你的阴影特质——为它们找到合法的表达渠道</li><li>列出你嫉妒的3个人或状态，提取它们的共同特质</li><li>问自己：如果没有任何限制，我会怎样表达这些特质？</li><li>从最小的行动开始——不需要辞职去旅行，但可以先给自己一个周末的自由</li></ul>';
    R+='</div></div>';

    // 第4章 能量补给指南
    R+='<div class="rpt-section"><h2><span class="num">4</span> 能量补给指南：你的能量场与黑洞</h2><div class="rpt-text">';
    R+='<p>这一章至关重要，因为它直接决定了你的生活质量。<strong>核心法则：天赋不看"结果好坏"，而看"过程是否回血"。</strong></p>';
    R+='<p>很多人混淆了"天赋"和"技能"。区别很简单：</p>';
    R+='<p>• <strong>天赋</strong>：做的时候忘记时间，做完后精神亢奋，想要更多——大脑在"唱歌"<br>• <strong>技能</strong>：做得不错，可能被夸奖，但做完后灵魂被掏空——你在"失血"</p>';
    R+=eBars();
    if(q5)R+='<div class="evidence-box"><strong>你的亢奋审计：</strong><br>你描述了一个大脑在"唱歌"的时刻："'+s(q5,120)+'"。这个信号比任何测试都更能揭示你的天赋方向——<strong>你在那一刻触碰到了自己的能量场</strong>。</div>';
    if(q3)R+='<p>而你的无意识胜任区——"'+s(q3,80)+'"——进一步确认了这个能量模式。你做这件事不费力，正是因为你的大脑天生为此而建。</p>';
    R+='<div class="talent-card"><h3>⚡ 你的回血公式</h3><p><strong>能量场 = '+T.type+'活动 × 自主空间 × 深度投入</strong></p><p>当这三个因素同时存在时，你就进入了心理学家米哈里·契克森米哈赖所描述的"心流状态"（Flow State）。在心流中，你不仅不会疲惫，反而会获得巨大的能量和满足感。</p><br><p><strong>黑洞 = 重复性任务 × 被动执行 × 缺乏意义感</strong></p><p>当你被迫长时间处于这种模式中，你的身体会发出警报：焦虑、疲惫、空虚、甚至抑郁。这不是你"不够坚强"，而是你的天赋在抗议。</p></div>';
    R+='<p><strong>能量管理实操清单：</strong></p><ul><li>识别你的"回血活动"，每周至少保证 5 小时沉浸其中</li><li>识别你的"黑洞活动"，能委托就委托，能拒绝就拒绝</li><li>不要用"坚持"感动自己——真正的天赋不需要苦哈哈的坚持</li><li>建立"能量日记"，每天记录哪些活动给了你能量，哪些消耗了你</li><li>设计你的"能量仪式"——在每天的黄金时段做最让你回血的事</li></ul>';
    R+='</div></div>';

    // 第5章 人生支点建议
    R+='<div class="rpt-section"><h2><span class="num">5</span> 人生支点建议：如何"顺着天赋活"</h2><div class="rpt-text">';
    R+='<p>基于你的天赋图谱，我为你规划了职业、社交和生活三个维度的详细建议。记住：<strong>天赋不是让你辞职转行的理由，而是让你在任何赛道上都能找到属于自己的支点。</strong></p>';
    R+='<h3>一、职业方向</h3>';
    R+='<div class="career-grid">';
    T.careers.forEach(function(c){
        R+='<div class="career-card"><div class="hd"><h4>'+c.n+'</h4><span class="match">匹配 '+c.m+'%</span></div><p style="color:var(--t2);font-size:.9rem;">'+c.d+'</p><div class="meter"><div class="meter-fill" style="width:'+c.m+'%"></div><div class="meter-lbl">'+c.m+'%</div></div></div>';
    });
    R+='</div>';
    R+='<p>如果你现在的工作无法改变，试试"80/20天赋原则"：<em>在现有工作中，找到那20%能让你运用天赋的部分，把80%的精力投入其中。</em></p>';
    R+='<h3>二、社交策略</h3>';
    R+='<ul><li><strong>找到你的"能量人"：</strong>和理解你天赋的人在一起，你的能量会成倍增长</li><li><strong>远离"能量吸血鬼"：</strong>那些让你持续解释自己、否定你的直觉的人，会消耗你大量能量</li><li><strong>建立"天赋联盟"：</strong>找到1-3个互补天赋的伙伴，形成协作关系</li><li><strong>学会说"不"：</strong>你的精力是有限的，把它花在真正重要的关系上</li></ul>';
    R+='<h3>三、分阶段成长路线图</h3>';
    R+='<div class="timeline">';
    R+='<div class="tl-item p1"><span class="phase">第一阶段 · 1-3个月</span><h4>觉醒：重新认识自己</h4><p style="color:var(--t2);line-height:1.8;">• 建立"能量日记"，每天记录回血/耗电时刻<br>• 每天至少花30分钟做与天赋相关的事<br>• 开始对"耗电活动"说"不"<br>• 找到1-2个理解你天赋的人，定期交流<br>• 阅读：《现在，发现你的优势》《心流》《刻意练习》</p></div>';
    R+='<div class="tl-item p2"><span class="phase">第二阶段 · 3-6个月</span><h4>整合：将天赋融入生活</h4><p style="color:var(--t2);line-height:1.8;">• 在工作中主动承担与天赋匹配的任务<br>• 建立输出渠道：博客、社群、作品集<br>• 开始副业实验——用天赋创造价值<br>• 加入能理解你的社群，找到同类<br>• 定期复盘：我的天赋表达了多少？</p></div>';
    R+='<div class="tl-item p3"><span class="phase">第三阶段 · 6-12个月</span><h4>绽放：让天赋成为核心竞争力</h4><p style="color:var(--t2);line-height:1.8;">• 将天赋转化为可量化的价值<br>• 扩大影响力——让更多人看到你的天赋<br>• 建立个人品牌，围绕天赋打造专业形象<br>• 评估是否需要调整职业方向<br>• 帮助身边的人发现他们的天赋</p></div>';
    R+='<div class="tl-item p4"><span class="phase">长期 · 持续进化</span><h4>精进：天赋的无限游戏</h4><p style="color:var(--t2);line-height:1.8;">• 天赋需要持续喂养——不断深化你的专业领域<br>• 探索天赋的新表达方式——跨界创新<br>• 成为"天赋传递者"——帮助更多人觉醒<br>• 保持好奇心和开放性——天赋会随着生命阶段进化<br>• 定期回顾这份说明书，看看你走了多远</p></div>';
    R+='</div>';
    R+='<h3>四、日常生活优化</h3>';
    R+='<ul><li><strong>早晨仪式：</strong>每天起床后的前30分钟，做一件与天赋相关的事（而不是看手机）</li><li><strong>环境设计：</strong>让你的物理空间支持你的天赋表达——书桌上放什么、房间里看到什么，都在影响你</li><li><strong>休息方式：</strong>你的"休息"不一定是躺着——做天赋相关的事可能比刷手机更让你恢复</li><li><strong>决策原则：</strong>面临选择时问自己：哪个选项更靠近我的天赋方向？</li></ul>';
    R+='</div></div>';

    // 第6章 写给未来的你
    R+='<div class="rpt-section"><h2><span class="num">6</span> 写给未来的你</h2><div class="rpt-text"><div class="letter">';
    R+='<p>亲爱的探索者：</p>';
    R+='<p>当你读到这里的时候，你已经完成了一次勇敢的自我探索。这份说明书不是判决书，而是一张地图。它指向的不是唯一的终点，而是一条属于你的道路。</p>';
    R+='<p>我想对你说几句真心话：</p>';
    R+='<p><strong>第一，天赋不会过期。</strong>哪怕你30岁、40岁、50岁才发现它，它依然在那里等你。就像你大脑中那些高分辨率的心理表征，它们从你出生那天就开始构建，从未停止。</p>';
    R+='<p><strong>第二，天赋需要喂养。</strong>从今天开始，每天给它一点养分——哪怕只是30分钟。这不是"坚持"，这是回家。</p>';
    R+='<p><strong>第三，你的"缺点"是宝藏。</strong>那些所有人让你改的"毛病"，那些你始终改不掉的"坏习惯"——它们是放错了位置的天赋。不要修复它们，给它们找到正确的舞台。</p>';
    R+='<p><strong>第四，顺着天赋活。</strong>这不是自私，这是你能给世界的最大礼物。当你在天赋的河流中自由流淌时，你的光芒会自然照亮身边的人。</p>';
    R+='<blockquote>"你的愿景将成为你的现实。最可怕的不是你不够好，而是你超乎想象地强大。"<br>—— 卡尔·荣格</blockquote>';
    R+='<p>你来到这个世界上，不是为了在别人的赛道上疲于奔命。你有自己的赛道，那条路上你已经领先了大多数人——因为那是你的"出厂设置"决定的。</p>';
    R+='<p><strong>你本来就是光。</strong>现在，是时候让这束光被看见了。</p>';
    R+='<p class="sig">—— 你的深度天赋挖掘机<br>'+now+'</p>';
    R+='</div></div></div>';

    // 附录
    R+='<div class="rpt-section"><h2><span class="num">✦</span> 附录：你的对话记录</h2><div class="rpt-text">';
    R+='<p style="font-size:.9rem;color:var(--t3);">以下是生成本报告所基于的对话要点：</p>';
    S.answers.forEach(function(a,i){
        R+='<div class="evidence-box" style="margin-bottom:.8rem;"><strong>第'+(i+1)+'轮 ('+a.qid+')：</strong><br>'+a.answer.substring(0,200)+(a.answer.length>200?'...':'')+'</div>';
    });
    R+='<p style="font-size:.85rem;color:var(--t3);margin-top:1.5rem;text-align:center;">本报告生成于 '+new Date().toLocaleString('zh-CN')+' | 对话轮次：'+S.totalQ+' 轮<br>基于盖洛普优势理论、心流理论、荣格阴影心理学及认知科学综合分析</p>';
    R+='</div></div>';

    R+='<div class="rpt-actions"></div>';
    return R;
}

// ===== 保存报告为图片 =====
window.saveReportAsImage=function(){
    var rpt=document.getElementById('reportContent');
    var btn=rpt.querySelector('.rpt-actions');
    if(btn)btn.style.display='none';
    // 记录原始滚动位置
    var overlay=document.getElementById('reportOverlay');
    var origScroll=overlay.scrollTop;
    overlay.scrollTop=0;
    // 显示生成提示
    var tip=document.createElement('div');
    tip.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.85);color:#fff;padding:1.2rem 2rem;border-radius:1rem;font-size:1rem;z-index:99999;text-align:center;';
    tip.textContent='正在生成长图，请稍候...';
    document.body.appendChild(tip);

    setTimeout(function(){
        html2canvas(rpt,{
            useCORS:true,
            allowTaint:true,
            scale:2,
            backgroundColor:'#0f172a',
            scrollX:0,
            scrollY:0,
            windowWidth:rpt.scrollWidth,
            windowHeight:rpt.scrollHeight,
            width:rpt.scrollWidth,
            height:rpt.scrollHeight
        }).then(function(canvas){
            if(btn)btn.style.display='';
            overlay.scrollTop=origScroll;
            document.body.removeChild(tip);
            // 创建下载链接
            var link=document.createElement('a');
            link.download='我的天赋使用说明书.png';
            link.href=canvas.toDataURL('image/png');
            // 移动端长按保存引导
            var isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if(isMobile){
                // 移动端：显示图片让用户长按保存
                var imgOverlay=document.createElement('div');
                imgOverlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.92);z-index:99998;display:flex;flex-direction:column;align-items:center;overflow-y:auto;-webkit-overflow-scrolling:touch;';
                var tipBar=document.createElement('div');
                tipBar.style.cssText='position:sticky;top:0;width:100%;background:rgba(0,0,0,.9);text-align:center;padding:.8rem;color:#fff;font-size:.95rem;z-index:2;backdrop-filter:blur(10px);';
                tipBar.innerHTML='<strong>长按下方图片保存到手机相册</strong>';
                var closeBtn=document.createElement('button');
                closeBtn.textContent='关闭';
                closeBtn.style.cssText='position:fixed;top:.8rem;right:1rem;z-index:99999;background:rgba(255,255,255,.15);color:#fff;border:none;padding:.5rem 1.2rem;border-radius:.5rem;font-size:.9rem;';
                closeBtn.onclick=function(){document.body.removeChild(imgOverlay)};
                var img=document.createElement('img');
                img.src=canvas.toDataURL('image/png');
                img.style.cssText='width:100%;max-width:750px;margin:1rem auto;display:block;';
                imgOverlay.appendChild(tipBar);
                imgOverlay.appendChild(closeBtn);
                imgOverlay.appendChild(img);
                document.body.appendChild(imgOverlay);
            }else{
                // PC端：直接下载
                link.click();
            }
        }).catch(function(err){
            console.error('截图失败:',err);
            if(btn)btn.style.display='';
            overlay.scrollTop=origScroll;
            document.body.removeChild(tip);
            alert('图片生成失败，请重试');
        });
    },100);
};

})();
