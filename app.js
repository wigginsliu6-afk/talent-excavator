(function(){
// ===== 设置弹窗 =====
var settingsBtn=document.getElementById('settingsBtn'),modalBg=document.getElementById('modalBg'),apiKeyInput=document.getElementById('apiKeyInput'),saveModal=document.getElementById('saveModal'),cancelModal=document.getElementById('cancelModal');
settingsBtn.onclick=function(){apiKeyInput.value=localStorage.getItem('deepseek_api_key')||'';modalBg.classList.add('show')};
cancelModal.onclick=function(){modalBg.classList.remove('show')};
modalBg.onclick=function(e){if(e.target===modalBg)modalBg.classList.remove('show')};
saveModal.onclick=function(){var k=apiKeyInput.value.trim();if(k){localStorage.setItem('deepseek_api_key',k);alert('API Key 已保存！')}else{localStorage.removeItem('deepseek_api_key');alert('已切换到本地分析模式。')}modalBg.classList.remove('show')};

// ===== 欢迎页 → 介绍页 → 对话 =====
var welcomeScreen=document.getElementById('welcomeScreen'),mainApp=document.getElementById('mainApp'),startBtn=document.getElementById('startBtn');
var introScreen=document.getElementById('introScreen'),readyBtn=document.getElementById('readyBtn');
startBtn.onclick=function(){welcomeScreen.classList.add('hidden');introScreen.style.display='flex'};
readyBtn.onclick=function(){introScreen.classList.add('hidden');mainApp.style.display='flex';setTimeout(startFromFirstQuestion,600)};

// ===== DOM =====
var chat=document.getElementById('chat'),userInput=document.getElementById('userInput'),sendBtn=document.getElementById('sendBtn'),inputBar=document.getElementById('inputBar');
var progressWrap=document.getElementById('progressWrap'),progressFill=document.getElementById('progressFill'),progressLabel=document.getElementById('progressLabel');
var loadingOverlay=document.getElementById('loadingOverlay'),loadingText=document.getElementById('loadingText'),loadingFillEl=document.getElementById('loadingFill');
var reportOverlay=document.getElementById('reportOverlay'),reportContent=document.getElementById('reportContent');

// ===== 状态 =====
var S={step:0,totalQ:0,answers:[],typing:false,complete:false,generating:false};

// ===== 问题库 =====
var CORE=[
{id:'q1',text:'好的，让我们开始第一次深度挖掘。\n\n**【第一个问题 · 回溯原初】**\n\n请试着回想 **16岁之前** ——那个你还没被社会完全规训的年代。\n\n有哪些事情是让你废寝忘食、甚至不需要任何奖励也会一头扎进去做的？\n\n或者，有哪些被大人反复批评的"顽固特质"？比如爱插嘴、太敏感、爱发呆、爱拆东西、话太多、过于较真……\n\n请尽量详细地描述那个画面和你当时的感受。',hint:'💡 可以想想：什么活动让你忘记吃饭？大人们怎么评价你这些行为？那时候你是什么心情？',fb:['谢谢你愿意分享这些珍贵的记忆。我能感受到那个画面的温度。让我继续挖掘……','这个细节很关键，我捕捉到了一些有趣的信号。这里面藏着重要的线索……','很好。那个时候的你，比现在的你更接近天赋的原初状态。我记住了这个信号。']},
{id:'q2',text:'**【第二个问题 · 无意识胜任】**\n\n现在让我们来到当下。\n\n在你的工作或生活中，有没有哪件事让你觉得：\n\n**"这还需要学吗？这不是基本常识吗？"**\n\n但奇怪的是，周围的人却觉得这事儿极难，甚至需要专门考证、刻意练习才能勉强做到。\n\n请描述这个场景。这是你的 **无意识胜任区** ——你做得太自然了，自然到自己都视而不见。',hint:'💡 比如：你能轻松做出漂亮的PPT / 别人问你问题你能瞬间给出清晰答案 / 协调各种事情对你来说不费吹灰之力',fb:['这种"轻而易举"正是天赋呼吸的方式。你做得太自然，以至于自己都忽视了它的价值。','很有意思。这说明你在这个领域拥有与生俱来的模式识别能力。别人需要刻意练习的，你天生就会。','你说的这个能力，对你来说像呼吸一样自然——但对绝大多数人来说，需要付出巨大努力才能达到。']},
{id:'q3',text:'**【第三个问题 · 能量审核】**\n\n这是一个非常重要的测试。\n\n**哪件事做完后，虽然身体很疲惫（可能熬夜了、高强度用脑了），但你的精神却极度亢奋？** 甚至忍不住想继续，有一种"这才是活着"的感觉？\n\n**反过来**，有没有什么事你做得很好、被大家夸奖，但做完后却感觉灵魂被掏空、只想躺平？\n\n请分别举例，描述那种能量状态。这是区分"天赋"和"技能"的关键分界线。',hint:'💡 比如：做完一次活动策划累趴了但兴奋到睡不着 vs 做完数据报表被夸了但只想逃离',fb:['这条信息极其关键。天赋是你的充电宝，技能往往只是耗电的工具。你的身体比大脑更诚实。','你的能量流向说明了一切。让你"回血"的事，才是天赋的方向。让你"失血"的事，哪怕做得再好，也只是消耗。','非常好的区分。这种能量差异，比任何测试都更能揭示你的天赋本质。']},
{id:'q4',text:'**【第四个问题 · 嫉妒的宝藏】**\n\n这个问题可能有点冒犯，但请诚实面对——因为它至关重要。\n\n你曾经对谁（或哪种生活状态）产生过 **强烈的、酸溜溜的嫉妒** ？\n\n不是那种"我也想买"的表面羡慕，而是深层的、甚至让你有点不舒服的——\n**"凭什么 ta 可以那样活？"**\n\n心理学告诉我们：**嫉妒是"被压抑的天赋"发出的尖叫。**\n\n请诚实说出：那个让你嫉妒的人是谁？ta 身上什么特质刺痛了你？',hint:'💡 比如：嫉妒那个辞职去旅行的朋友 / 嫉妒同事能在会议上自信表达 / 嫉妒某个博主可以靠热爱的事养活自己',fb:['感谢你的诚实。这声尖叫中，藏着你最渴望释放的力量。嫉妒是灵魂的镜子。','你看到的、刺痛你的，其实是你自己渴望成为但不敢承认的样子。这是最重要的线索。','嫉妒不是缺陷，而是你内心深处发出的信号：你也有这个能力，只是还没有允许自己去使用。']}
];

var FOLLOW_UPS=['这个回答很有意思，但我感觉还有更深的东西。能举一个最具体的例子吗？当时发生了什么？','我想了解更多细节——那个时刻你的身体有什么反应？是心跳加速、兴奋，还是某种奇异的平静？','你提到的这个点很关键。能不能展开说说？为什么你觉得这件事对你来说如此重要？','如果回到那个时刻，你会对当时的自己说什么？','谢谢你的分享。让我再追问一下——这种感觉，在你最近的生活中还出现过吗？'];

var EXTRA=[
{id:'qx1',text:'**【追加探索】**\n\n基于你之前的回答，我发现了一个有趣的模式。\n\n如果把你人生中最享受的 3 个时刻抽出来，忽略"做了什么"这件事本身，**它们有什么共同的"感觉"？**\n\n是"我被需要"？"我在创造"？"我洞穿了真相"？"我连接了他人"？还是别的什么？',hint:'💡 试着闭眼回想那三个瞬间，感受它们的交集是什么'},
{id:'qx2',text:'**【反向测试】**\n\n如果从明天开始，你 **完全不能做那些让你回血的事** ，必须日复一日做相反的事——\n\n你会有什么感觉？这种"被剥夺感"有多强烈？请用 1-10 分来描述。',hint:'💡 不需要美化，说出最真实的感受'},
{id:'qx3',text:'**【身份认同】**\n\n在你的内心深处，你觉得自己"本质上"是一个什么样的人？不是别人给你贴的标签，不是你的职位头衔，而是那个最核心的"你"。\n\n如果要用一个比喻来形容，你会说你是什么？',hint:'💡 比如：我本质上是一个探索者 / 连接者 / 创造者'}
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
    var c=Math.min(S.step,4);
    progressFill.style.width=(c/4*100)+'%';
    progressLabel.textContent=c+'/4';
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
    if(text.length<40&&S.totalQ<10){await typeBubble(pick(FOLLOW_UPS),'ai');return}
    if(cq&&cq.fb)await typeBubble(pick(cq.fb),'ai');
    await sleep(500);
    if(ci<CORE.length-1){await askCore(ci+1)}
    else if(ci===CORE.length-1){S.step=CORE.length;updateProgress();
        if(S.totalQ<6){var eq=pick(EXTRA);await typeBubble(eq.text,'ai');await sleep(300);addBubble(eq.hint,'hint')}
        else await finishDialog();
    }else{
        if(S.totalQ<8&&Math.random()<0.5){var used=S.answers.map(function(a){return a.qid});var rem=EXTRA.filter(function(q){return used.indexOf(q.id)<0});if(rem.length>0){var eq=pick(rem);await typeBubble(eq.text,'ai');await sleep(300);addBubble(eq.hint,'hint');return}}
        await finishDialog();
    }
}

async function finishDialog(){
    S.complete=true;
    await typeBubble('我已经收集了足够的信息。基于我们 **'+S.totalQ+' 轮** 深度对话，我现在可以为你生成一份详尽的《个人天赋使用说明书》了。\n\n这份说明书将包含：\n• 你的核心天赋识别与深度解析\n• 童年阴影与天赋的关联\n• 能量模式与回血逻辑\n• 无意识胜任区解析\n• 嫉妒背后的天赋信号\n• 适合你的职业方向与详细建议\n• 分阶段成长路线图\n• 写给未来的你的一封信\n\n准备好迎接这份属于你的生命说明书了吗？','ai');
    inputBar.innerHTML='<button class="gen-btn" id="genBtn">✨ 生成我的天赋说明书</button>';
    document.getElementById('genBtn').onclick=generateReport;
}

sendBtn.onclick=handleSend;
userInput.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}});

// ===== 报告生成 =====
async function generateReport(){
    S.generating=true;loadingOverlay.classList.add('show');loadingFillEl.style.width='0%';
    var msgs=['正在分析你的童年记忆模式...','正在识别无意识胜任区...','正在进行能量模式审核...','正在解码嫉妒信号...','正在构建天赋雷达图...','正在生成职业匹配分析...','正在撰写成长路线图...','正在书写给未来你的信...','最终整合中，即将完成...'];
    var mi=0;var iv=setInterval(function(){if(mi<msgs.length){loadingText.textContent=msgs[mi];loadingFillEl.style.width=((mi+1)/msgs.length*95)+'%';mi++}},1200);
    try{
        var apiKey=localStorage.getItem('deepseek_api_key');var html;
        if(apiKey){html=await genWithAI(apiKey)}else{await sleep(msgs.length*1200+500);html=genLocal()}
        clearInterval(iv);loadingFillEl.style.width='100%';await sleep(500);showReport(html);
    }catch(e){clearInterval(iv);console.error(e);showReport(genLocal())}finally{loadingOverlay.classList.remove('show');S.generating=false}
}

async function genWithAI(apiKey){
    var at=S.answers.map(function(a,i){return '问题'+(i+1)+' ('+a.qid+'): '+a.question+'\n用户回答: '+a.answer}).join('\n\n');
    var prompt='你是"深度天赋挖掘机"，结合盖洛普优势理论、心流理论与荣格心理学的资深生涯咨询师。请基于以下对话生成一万字以上的《个人天赋使用说明书》。\n\n要求：1)一万字以上，极详尽专业有共情力 2)使用HTML格式，段落用<p>标题用<h3>强调用<strong> 3)包含：致探索者开篇、核心天赋识别、童年线索与天赋觉醒、能量模式分析、无意识胜任区解析、嫉妒背后的密码、职业方向建议、分阶段成长路线图、写给未来的信 4)温暖共情犀利有深度 5)每个模块用<div class="rpt-section">包裹\n\n用户对话：\n'+at;
    var resp=await fetch('https://api.deepseek.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify({model:'deepseek-chat',messages:[{role:'system',content:'你是深度天赋挖掘机。请用HTML格式生成报告。'},{role:'user',content:prompt}],temperature:0.85,max_tokens:8000})});
    if(!resp.ok)throw new Error('API fail');var data=await resp.json();
    return shell(data.choices[0].message.content);
}

function shell(body){return '<div class="rpt-cover"><span class="deco">🔮</span><h1>《个人天赋使用说明书》</h1><p class="sub">深度对话结晶 · '+S.totalQ+' 轮挖掘 · '+new Date().toLocaleDateString('zh-CN')+'</p></div><div class="rpt-text">'+body+'</div><div class="rpt-actions"><button class="primary" onclick="window.print()">🖨️ 打印保存</button><button class="secondary" onclick="location.reload()">🔄 重新探索</button></div>'}

function showReport(html){reportContent.innerHTML=html;reportOverlay.classList.add('show');document.body.style.overflow='hidden';reportOverlay.scrollTop=0}

// ===== 本地报告 =====
function genLocal(){
    var a=S.answers,q1=g('q1'),q2=g('q2'),q3=g('q3'),q4=g('q4'),all=(q1+q2+q3+q4).toLowerCase();
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

    // 第1章
    R+='<div class="rpt-section"><h2><span class="num">1</span> 致亲爱的探索者</h2><div class="rpt-text">';
    R+='<p>亲爱的探索者：</p>';
    R+='<p>感谢你愿意与我进行这场深度对话。在这'+S.totalQ+'轮交流中，我已经捕捉到了足够多的信号——它们构成了一幅独特的天赋图谱，属于你，独一无二。</p>';
    R+='<p>在开始之前，我想先告诉你：<strong>你今天愿意花时间探索自己，本身就是一种勇气，也是你对生命的尊重。</strong></p>';
    R+='<p>很多人一辈子都在别人的期待中奔跑，从未停下来问自己："我到底擅长什么？什么事情让我真正活过来？"你今天做了这件事，这意味着你已经走在了大多数人前面。</p>';
    R+='<p>接下来，我将用盖洛普优势理论、心流理论和荣格心理学的综合视角，为你解读这幅天赋图谱。这不是一份简单的"性格测试报告"——它是一面镜子，映照出你灵魂最深处的渴望和力量。</p>';
    R+='<p>在我们的对话中，我注意到你的回答中有一种独特的节奏。你描述事物的方式、你选择强调的细节、你回避或犹豫的地方——这些都是线索。有些线索你自己可能都没有意识到，但它们正在告诉我一个清晰的故事。</p>';
    R+='<p><em>请准备好，我们即将深入。这份说明书可能会让你感到意外，甚至有些不舒服——因为天赋的真相，往往和我们以为的"正确方向"不一样。</em></p>';
    R+='</div></div>';

    // 第2章 核心天赋
    R+='<div class="rpt-section"><h2><span class="num">2</span> 你的核心天赋识别</h2><div class="rpt-text">';
    R+='<p>在盖洛普优势理论中，有一个核心概念叫"才干"（Talent）——它是你自然而然、反复出现的思维、感受和行为模式。才干不同于知识和技能，它是你的"出厂配置"，是你不需要学习就天然拥有的能力基底。</p>';
    R+='<p>我们区分四个层次的能力：<br>1. <strong>知识</strong>（Knowledge）——你学到的东西，可以被遗忘<br>2. <strong>技能</strong>（Skill）——你练习掌握的，需要维护<br>3. <strong>才干</strong>（Talent）——你天生的思维模式，不会消失<br>4. <strong>优势</strong>（Strength）= 才干 × 知识 × 技能</p>';
    R+='<p>基于我们的深度对话，我为你的核心天赋命名为：</p>';
    R+='<div class="talent-card"><h3>'+T.icon+' '+T.name+' <span class="tag">'+T.type+'天赋</span></h3><p>'+T.desc+'</p>';
    R+='<div class="evidence-box"><strong>来自对话的证据：</strong><br>';
    if(q1)R+='在你描述童年经历时，你提到了"'+s(q1,60)+'"——这个细节暴露了你的天赋原型。你的神经系统对这类活动有着天然的愉悦反应，这不是后天培养的，而是出厂自带的。<br><br>';
    if(q2)R+='当你描述无意识胜任区时，你说"'+s(q2,60)+'"——这种"轻描淡写"的背后，是别人需要刻意练习才能达到的水平。这正是天赋的典型特征：你做得太自然了，自然到自己都视而不见。';
    R+='</div></div>';
    R+='<p><strong>深度解析：为什么是"'+T.name+'"？</strong></p>';
    R+='<p>'+T.name+'属于才干层——它是你所有能力的基底。你在这个基础上叠加的任何知识和技能，都会产生指数级的效果。反过来，如果你忽视这个基底，在不匹配的方向上叠加知识和技能，就会事倍功半，越努力越疲惫。</p>';
    R+='<p><strong>这就是为什么很多人"明明很努力却活得很累"的根本原因——他们在错误的基底上建造大厦。</strong></p>';
    R+='<p>你的天赋就像一条河流——它有自己天然的流向。你可以修建堤坝暂时改变它的方向，但这需要消耗巨大的能量，而且堤坝迟早会崩溃。聪明的做法是：顺着河流的方向，修建水渠和水车，让它在自然流淌的过程中创造价值。</p>';
    R+=radar(rd);
    R+='<p style="text-align:center;font-size:.85rem;color:var(--t3);">你的天赋雷达图 · 数据基于对话分析</p>';
    R+='</div></div>';

    // 第3章 阴影
    R+='<div class="rpt-section"><h2><span class="num">3</span> 童年线索与天赋觉醒：阴影即宝藏</h2><div class="rpt-text">';
    R+='<p>荣格心理学中有一个深刻的概念——<strong>"阴影"（Shadow）</strong>。它是你人格中被压抑、不被接受的部分。有趣的是，你的"阴影"往往正是你天赋的另一种表达方式。</p>';
    R+='<p>每一个被批评的"缺点"，都是一扇通向天赋的暗门。当我们还是孩子的时候，天赋以最原始、最不加修饰的方式表达自己。但因为这种表达方式常常不符合成人世界的规则，它就被贴上了"问题行为"的标签。</p>';
    R+='<div class="shadow-zone"><p style="font-style:italic;font-size:1.05rem;margin-bottom:1rem;padding:1rem;border-left:3px solid var(--pink);background:rgba(236,72,153,.06);border-radius:0 .5rem .5rem 0;">"'+dt.tr+'"不是你的缺点——它是<strong>'+dt.gi+'</strong>的早期信号。</p>';
    R+='<div class="trait-grid"><div class="trait-item"><div class="lbl">被批评的特质</div><div class="val">'+dt.tr+'</div></div><div class="trait-item"><div class="lbl">隐藏的天赋</div><div class="val" style="color:var(--pink-l);">'+dt.gi+'</div></div><div class="trait-item"><div class="lbl">深层驱动</div><div class="val">'+dt.sh+'</div></div><div class="trait-item"><div class="lbl">转化方向</div><div class="val" style="color:var(--green);">'+dt.tf+'</div></div></div></div>';
    if(q1)R+='<p>你提到在16岁之前，"'+s(q1,80)+'"。这些经历看起来平淡无奇，但从心理学的角度来看，它们是天赋的"胚胎期表达"。</p>';
    R+='<p>想象一下：一颗橡树的种子，在它还是种子的时候，你只能看到一个小小的、不起眼的东西。但它的基因编码里，写满了参天大树的蓝图。<strong>你童年那些"不合时宜"的行为，就是天赋种子的萌芽。</strong>它们被大人批评、被老师纠正、被环境压抑——但它们从未消失，只是转入了地下，以更隐蔽的方式持续生长。</p>';
    R+='<p>现在，是时候让它们重新见光了。</p>';
    R+='<div class="icon-grid"><div class="icon-item"><div class="emoji">🌱</div><div class="label">种子期</div></div><div class="icon-item"><div class="emoji">🌿</div><div class="label">萌芽期</div></div><div class="icon-item"><div class="emoji">🌳</div><div class="label">生长期</div></div><div class="icon-item"><div class="emoji">🌲</div><div class="label">成熟期</div></div><div class="icon-item"><div class="emoji">🌸</div><div class="label">绽放期</div></div><div class="icon-item"><div class="emoji">🍎</div><div class="label">结果期</div></div></div>';
    R+='<p style="text-align:center;font-size:.85rem;color:var(--t3);">天赋的生命周期 · 你目前正处于觉醒阶段</p>';
    R+='<p><strong>给你的建议：</strong>不要再试图"修复"你的阴影特质。相反，<em>为它们找到合法的表达渠道</em>。就像河水不能用堵的方式来治理——你需要为它修建河道，让它在正确的方向上自由流淌。</p>';
    R+='</div></div>';

    // 第4章 能量
    R+='<div class="rpt-section"><h2><span class="num">4</span> 能量模式与回血逻辑</h2><div class="rpt-text">';
    R+='<p>这一章至关重要，因为它直接关系到你的生活质量和职业选择。</p>';
    R+='<p><strong>核心法则：真正的天赋是让你"回血"的事，而不是你擅长但做完很累的事。</strong></p>';
    R+='<p>很多人混淆了"天赋"和"技能"。区别很简单：</p>';
    R+='<p>• <strong>天赋</strong>：做的时候忘记时间，做完后精神亢奋，想要更多<br>• <strong>技能</strong>：做得不错，可能被夸奖，但做完后灵魂被掏空</p>';
    R+=eBars();
    if(q3)R+='<div class="evidence-box"><strong>你的能量证据：</strong><br>'+s(q3,120)+'</div>';
    R+='<div class="talent-card"><h3>⚡ 你的回血公式</h3><p><strong>高能量 = '+T.type+'活动 × 自主空间 × 深度投入</strong></p><p>当这三个因素同时存在时，你就进入了心理学家米哈里·契克森米哈赖所描述的"心流状态"（Flow State）。在心流中，你不仅不会疲惫，反而会获得巨大的能量和满足感。</p><br><p><strong>低能量 = 重复性任务 × 被动执行 × 缺乏意义感</strong></p><p>当你被迫长时间处于这种模式中，你的身体会发出警报：焦虑、疲惫、空虚、甚至抑郁。这不是你"不够坚强"，而是你的天赋在抗议。</p></div>';
    R+='<p><strong>实用建议：</strong></p><ul><li>识别你的"回血活动"，每周至少保证 5 小时沉浸其中</li><li>识别你的"耗电活动"，能委托就委托，能拒绝就拒绝</li><li>不要用"坚持"感动自己——真正的天赋不需要苦哈哈的坚持</li><li>建立"能量日记"，每天记录哪些活动给了你能量，哪些消耗了你</li></ul>';
    R+='</div></div>';

    // 第5章 无意识胜任区
    R+='<div class="rpt-section"><h2><span class="num">5</span> 无意识胜任区：你看不见的护城河</h2><div class="rpt-text">';
    if(q2)R+='<p>你说"'+s(q2,80)+'"。</p>';
    R+='<p>这意味着在这个领域，你拥有<strong>别人需要刻意练习才能获得的能力</strong>。这不是因为你更努力，而是因为你的神经回路天生就更适应这类活动。就像有些人天生音感好，不需要学就能辨别音调——你在你的领域也是如此。</p>';
    R+='<p>在商业世界中，这叫做"护城河"（Moat）。你的无意识胜任区，就是你职业生涯中最宽的护城河。</p>';
    R+='<p><strong>为什么你自己看不见它？</strong></p>';
    R+='<p>因为天赋的悖论在于：你越擅长的事，你越觉得"不算什么"。正是因为它对你来说太容易了，你反而低估了它的价值。你以为所有人都能做到，但事实是——大多数人做不到。</p>';
    R+='<p>心理学家将这种现象称为"无意识胜任"（Unconscious Competence）——你已经精通到无需思考就能自动完成的程度。这是技能发展的最高阶段，但对于天赋来说，你可能从一开始就处于这个阶段。</p>';
    R+='<p><strong>建议：</strong></p><ul><li>不要浪费你的护城河优势——选择那些能让你发挥这项天赋的赛道</li><li>主动询问身边人"你觉得我什么做得特别好"——他们能看见你的盲区</li><li>把你的"理所当然"变成产品或服务——别人愿意为此付费</li></ul>';
    R+='</div></div>';

    // 第6章 嫉妒
    R+='<div class="rpt-section"><h2><span class="num">6</span> 嫉妒背后的天赋密码</h2><div class="rpt-text">';
    if(q4)R+='<p>你说"'+s(q4,80)+'"。</p>';
    R+='<p><strong>嫉妒是灵魂的镜子。</strong></p>';
    R+='<p>你嫉妒的对象，往往是你内心深处渴望成为但不敢承认的自己。那种"凭什么ta可以"的感觉，实际上是你内心深处发出的呐喊：</p>';
    R+='<p><em>"我也想要那种自由！"<br>"我也想那样表达自己！"<br>"我也可以！"</em></p>';
    R+='<p><strong>请不要为嫉妒感到羞耻。</strong>在荣格心理学中，嫉妒是"投射"（Projection）的一种形式——你在他人身上看到了自己被压抑的那部分。当你嫉妒某人的自由、勇气或创造力时，那恰恰说明你的内心也拥有这些品质，只是你还没有允许自己去使用。</p>';
    R+='<p>嫉妒不是毒药——它是一张藏宝图。顺着嫉妒的方向走，你就能找到被你封印的那部分力量。</p>';
    R+='<p><strong>转化练习：</strong></p><ul><li>列出你嫉妒的3个人或状态</li><li>提取它们的共同特质（比如：自由、表达、被认可）</li><li>问自己：如果没有任何限制，我会怎样表达这些特质？</li><li>从最小的行动开始——不需要辞职去旅行，但可以先给自己一个周末的自由</li></ul>';
    R+='</div></div>';

    // 第7章 职业
    R+='<div class="rpt-section"><h2><span class="num">7</span> 适合你的人生赛道</h2><div class="rpt-text">';
    R+='<p>基于你的天赋图谱，我为你推荐以下职业方向。请注意：这不是让你立刻辞职转行，而是为你指出一个<strong>长期演化的方向</strong>。</p>';
    R+='<div class="career-grid">';
    T.careers.forEach(function(c){
        R+='<div class="career-card"><div class="hd"><h4>'+c.n+'</h4><span class="match">匹配 '+c.m+'%</span></div><p style="color:var(--t2);font-size:.9rem;">'+c.d+'</p><div class="meter"><div class="meter-fill" style="width:'+c.m+'%"></div><div class="meter-lbl">'+c.m+'%</div></div></div>';
    });
    R+='</div>';
    R+='<p><strong>重要提醒：</strong>职业只是天赋的容器，不是天赋本身。同样的天赋可以在完全不同的职业中表达。关键不是"做什么职业"，而是"在任何职业中，是否能运用你的核心天赋"。</p>';
    R+='<p>如果你现在的工作无法改变，试试这个策略：<em>在现有工作中，找到那20%能让你运用天赋的部分，把80%的精力投入其中。</em>这被称为"80/20天赋原则"——用最少的改变获得最大的能量回报。</p>';
    R+='</div></div>';

    // 第8章 路线图
    R+='<div class="rpt-section"><h2><span class="num">8</span> 你的成长路线图</h2><div class="rpt-text">';
    R+='<p>知道天赋是什么只是第一步。接下来，你需要一个清晰的行动计划来<strong>唤醒、整合、绽放</strong>你的天赋。</p>';
    R+='<div class="timeline">';
    R+='<div class="tl-item p1"><span class="phase">第一阶段 · 1-3个月</span><h4>觉醒：重新认识自己</h4><p style="color:var(--t2);line-height:1.8;">• 建立"能量日记"，每天记录回血/耗电时刻<br>• 每天至少花30分钟做与天赋相关的事<br>• 开始对"耗电活动"说"不"<br>• 找到1-2个理解你天赋的人，定期交流<br>• 阅读相关书籍：《现在，发现你的优势》《心流》</p></div>';
    R+='<div class="tl-item p2"><span class="phase">第二阶段 · 3-6个月</span><h4>整合：将天赋融入生活</h4><p style="color:var(--t2);line-height:1.8;">• 在工作中主动承担与天赋匹配的任务<br>• 建立输出渠道：博客、社群、作品集<br>• 开始副业实验——用天赋创造价值<br>• 加入能理解你的社群，找到同类<br>• 定期复盘：我的天赋表达了多少？</p></div>';
    R+='<div class="tl-item p3"><span class="phase">第三阶段 · 6-12个月</span><h4>绽放：让天赋成为核心竞争力</h4><p style="color:var(--t2);line-height:1.8;">• 将天赋转化为可量化的价值<br>• 扩大影响力——让更多人看到你的天赋<br>• 建立个人品牌，围绕天赋打造专业形象<br>• 评估是否需要调整职业方向<br>• 帮助身边的人发现他们的天赋</p></div>';
    R+='<div class="tl-item p4"><span class="phase">长期 · 持续进化</span><h4>精进：天赋的无限游戏</h4><p style="color:var(--t2);line-height:1.8;">• 天赋需要持续喂养——不断深化你的专业领域<br>• 探索天赋的新表达方式——跨界创新<br>• 成为"天赋传递者"——帮助更多人觉醒<br>• 保持好奇心和开放性——天赋会随着生命阶段进化<br>• 定期回顾这份说明书，看看你走了多远</p></div>';
    R+='</div></div></div>';

    // 第9章 信
    R+='<div class="rpt-section"><h2><span class="num">9</span> 写给未来的你</h2><div class="rpt-text"><div class="letter">';
    R+='<p>亲爱的探索者：</p>';
    R+='<p>当你读到这里的时候，你已经完成了一次勇敢的自我探索。这份说明书不是判决书，而是一张地图。它指向的不是唯一的终点，而是一条属于你的道路。</p>';
    R+='<p>我想对你说几句真心话：</p>';
    R+='<p><strong>第一，天赋不会过期。</strong>哪怕你30岁、40岁、50岁才发现它，它依然在那里等你。就像一颗种子，无论在地下沉睡了多少年，只要阳光和雨水到来，它就会苏醒。你的天赋也是如此——它不会因为被忽视而消失，只是在等待你的召唤。</p>';
    R+='<p><strong>第二，天赋需要喂养。</strong>如果你发现了天赋却不使用它，它会沉睡。但不用担心，它永远不会消失。从今天开始，每天给它一点养分——哪怕只是30分钟，也是一种承诺。</p>';
    R+='<p><strong>第三，天赋有代价。</strong>你与众不同的地方，也是你可能被误解的地方。选择做自己，意味着你不一定会被所有人理解。但请记住：被误解是天赋的门票价格。你不需要所有人的认可，你只需要忠于自己内心的声音。</p>';
    R+='<p><strong>第四，你不是你的产出。</strong>天赋不是你做了什么，而是你做这件事时的那种"回家"的感觉。不要用"做了多少"来衡量自己，要用"活出了多少真实"来衡量。</p>';
    R+='<blockquote>"你的愿景将成为你的现实。相信自己，相信你心中的渴望，相信那些让你活过来的事物。"<br>—— 卡尔·荣格</blockquote>';
    R+='<p>你来到这个世界上，不是为了在别人的赛道上疲于奔命。你有自己的赛道，那条路上你已经领先了大多数人。</p>';
    R+='<p><strong>你本来就是光。</strong>现在，是时候让这束光被看见了。</p>';
    R+='<p class="sig">—— 你的深度天赋挖掘机<br>'+now+'</p>';
    R+='</div></div></div>';

    // 附录
    R+='<div class="rpt-section"><h2><span class="num">✦</span> 附录：你的对话记录</h2><div class="rpt-text">';
    R+='<p style="font-size:.9rem;color:var(--t3);">以下是生成本报告所基于的对话要点：</p>';
    S.answers.forEach(function(a,i){
        R+='<div class="evidence-box" style="margin-bottom:.8rem;"><strong>第'+(i+1)+'轮 ('+a.qid+')：</strong><br>'+a.answer.substring(0,200)+(a.answer.length>200?'...':'')+'</div>';
    });
    R+='<p style="font-size:.85rem;color:var(--t3);margin-top:1.5rem;text-align:center;">本报告生成于 '+new Date().toLocaleString('zh-CN')+' | 对话轮次：'+S.totalQ+' 轮<br>基于盖洛普优势理论、心流理论、荣格心理学综合分析</p>';
    R+='</div></div>';

    R+='<div class="rpt-actions"><button class="primary" onclick="window.print()">🖨️ 打印保存</button><button class="secondary" onclick="location.reload()">🔄 重新探索</button></div>';
    return R;
}

})();
