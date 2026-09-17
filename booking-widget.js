(function () {
  "use strict";

  const currentScript = document.currentScript;
  const config = {
    apiBase: (currentScript?.dataset.api || "").replace(/\/$/, ""),
    mode: currentScript?.dataset.mode || "demo",
    email: currentScript?.dataset.email || "pejisystems@gmail.com",
    sms: currentScript?.dataset.sms || "3439982681",
  };
  const logoUrl = new URL("./assets/chicco-logo.png", currentScript?.src || window.location.href).href;

  const BRANCHES = [
    { id: "kanata", name: "Kanata", area: "Terry Fox Drive", icon: "K", tone: "mint" },
    { id: "barrhaven", name: "Barrhaven", area: "Strandherd Drive", icon: "B", tone: "peach" },
    { id: "merivale", name: "Merivale", area: "Merivale Road", icon: "M", tone: "yellow" },
    { id: "riverside", name: "Riverside South", area: "Earl Armstrong Road", icon: "R", tone: "blue" },
    { id: "downtown", name: "Downtown", area: "Bank Street", icon: "D", tone: "lilac" },
  ];
  const SERVICES = [
    { id: "exam", name: "Comprehensive Eye Exam", detail: "A complete vision and eye health check", duration: "45 min" },
    { id: "contacts", name: "Contact Lens Fitting", detail: "Fit, comfort, and care guidance", duration: "45 min" },
    { id: "adjustment", name: "Frame Adjustment", detail: "A quick tune-up for your favourite frames", duration: "20 min" },
  ];

  const I18N = {
    en: {
      fab: "Book an exam",
      steps: [
        ["Your visit", "Location & service"],
        ["Date & time", "Pick a live slot"],
        ["Your details", "Just the essentials"],
        ["All set", "Confirmation"],
      ],
      needHelp: "Need a hand?",
      callText: "Call or text",
      liveBooking: "Live booking",
      liveDemo: "Live demo",
      closeLabel: "Close booking dialog",
      back: "← Back",
      continue: "Continue",
      confirmBooking: "Confirm booking",
      bookingPending: "Booking…",
      step1Kicker: "Step 1 of 3",
      step1Title: "Where should we see you?",
      step1Sub: "Choose a neighbourhood and the kind of visit you need.",
      selectLocation: "Select a location",
      whatCanWeHelp: "What can we help with?",
      step2Kicker: "Step 2 of 3",
      step2Title: "Pick a time that fits.",
      step2Sub: (branch) => `Showing ${config.apiBase ? "live" : "simulated"} availability at ${branch}.`,
      prevMonth: "Previous month",
      nextMonth: "Next month",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      selectDateFirst: "Available appointment times will appear here.",
      checkingSlots: "Checking live availability…",
      noSlots: "No online times remain for this date. Please choose another day.",
      slotSelectedTitle: "Select a date",
      liveChecked: config.apiBase ? "Booking calendar checked just now" : "Demo availability",
      step3Kicker: "Step 3 of 3",
      step3Title: "A few final details.",
      step3Sub: "We'll use these only for your appointment confirmation and reminder.",
      fullName: "Full name",
      namePlaceholder: "e.g. Alex Chen",
      email: "Email",
      emailPlaceholder: "alex@example.com",
      mobile: "Mobile number",
      mobilePlaceholder: "(613) 555-0123",
      privacyTitle: "Your privacy matters.",
      privacyText: "We never ask for medical details or an OHIP number here. Your contact details are used only to coordinate this visit.",
      errName: "Please enter your name",
      errEmail: "Enter a valid email",
      errPhone: "Enter a valid mobile number",
      confirmedKicker: "Appointment confirmed",
      requestPreparedKicker: "Request prepared",
      bookedTitle: (name) => `You're booked, ${name}.`,
      readyTitle: (name) => `You're ready, ${name}.`,
      emailSentTo: (email) => `A confirmation email has been sent to ${email}.`,
      bookingRef: (ref) => `Booking reference: ${ref}`,
      addCalendarPrompt: "Add the confirmed appointment to your preferred calendar.",
      googleCal: "＋ Google Calendar",
      outlookCal: "＋ Outlook",
      appleCal: "↓ Apple / ICS",
      done: "Done",
      branches: {
        kanata: { name: "Kanata", area: "Terry Fox Drive" },
        barrhaven: { name: "Barrhaven", area: "Strandherd Drive" },
        merivale: { name: "Merivale", area: "Merivale Road" },
        riverside: { name: "Riverside South", area: "Earl Armstrong Road" },
        downtown: { name: "Downtown", area: "Bank Street" },
      },
      services: {
        exam: { name: "Comprehensive Eye Exam", detail: "A complete vision and eye health check", duration: "45 min" },
        contacts: { name: "Contact Lens Fitting", detail: "Fit, comfort, and care guidance", duration: "45 min" },
        adjustment: { name: "Frame Adjustment", detail: "A quick tune-up for your favourite frames", duration: "20 min" },
      },
    },
    zh: {
      fab: "预约验光",
      steps: [
        ["您的预约", "门店与项目"],
        ["日期时间", "选择可用时段"],
        ["个人信息", "基本联络资料"],
        ["预约完成", "确认详情"],
      ],
      needHelp: "需要协助？",
      callText: "致电或短信",
      liveBooking: "实时预约",
      liveDemo: "实时演示",
      closeLabel: "关闭预约窗口",
      back: "← 返回",
      continue: "下一步",
      confirmBooking: "确认预约",
      bookingPending: "正在预约…",
      step1Kicker: "第 1 步 / 共 3 步",
      step1Title: "选择就近门店与服务",
      step1Sub: "请选择您希望前往的渥太华门店及预约项目。",
      selectLocation: "选择就诊门店",
      whatCanWeHelp: "需要哪项眼科服务？",
      step2Kicker: "第 2 步 / 共 3 步",
      step2Title: "选择合适的时间",
      step2Sub: (branch) => `显示 ${branch} 门店的实时空闲时段。`,
      prevMonth: "上个月",
      nextMonth: "下个月",
      weekdays: ["日", "一", "二", "三", "四", "五", "六"],
      selectDateFirst: "请选择上方日期以查看可用时段。",
      checkingSlots: "正在查询实时时段…",
      noSlots: "该日期暂无可在线预约的时段，请选择其他日期。",
      slotSelectedTitle: "选择预约日期",
      liveChecked: config.apiBase ? "已同步最新可预约日程" : "演示时段",
      step3Kicker: "第 3 步 / 共 3 步",
      step3Title: "填写基本联络信息",
      step3Sub: "此信息仅用于发送预约确认及到店提醒。",
      fullName: "姓名",
      namePlaceholder: "例如：张伟",
      email: "电子邮箱",
      emailPlaceholder: "example@email.com",
      mobile: "手机号码",
      mobilePlaceholder: "(613) 555-0123",
      privacyTitle: "严格保护您的隐私",
      privacyText: "绝不收集安省健康卡 (OHIP) 或任何病历健康数据。您的联络方式仅用于统筹本次就诊。",
      errName: "请输入您的姓名",
      errEmail: "请输入有效的电子邮箱",
      errPhone: "请输入有效的手机号码",
      confirmedKicker: "预约已确认",
      requestPreparedKicker: "预约信息已就绪",
      bookedTitle: (name) => `预约成功，${name}！`,
      readyTitle: (name) => `准备就绪，${name}！`,
      emailSentTo: (email) => `确认信已发送至 ${email}。`,
      bookingRef: (ref) => `预约编号：${ref}`,
      addCalendarPrompt: "将已确认的预约添加到您的个人日历：",
      googleCal: "＋ 添加到谷歌日历",
      outlookCal: "＋ Outlook 日历",
      appleCal: "↓ 下载 Apple / ICS 日历",
      done: "完成",
      branches: {
        kanata: { name: "Kanata 卡纳塔", area: "Terry Fox Drive" },
        barrhaven: { name: "Barrhaven 巴尔黑文", area: "Strandherd Drive" },
        merivale: { name: "Merivale 梅里韦尔", area: "Merivale Road" },
        riverside: { name: "Riverside South 南河滨", area: "Earl Armstrong Road" },
        downtown: { name: "Downtown 市中心", area: "Bank Street" },
      },
      services: {
        exam: { name: "全面眼科验光", detail: "完整视力与眼健康深度检查", duration: "45 分钟" },
        contacts: { name: "隐形眼镜验配", detail: "度数试戴、舒适度与佩戴护理指导", duration: "45 分钟" },
        adjustment: { name: "镜框调整与维护", detail: "为您喜爱的镜框快速校准与调适", duration: "20 分钟" },
      },
    },
  };

  const css = `
    :host{--ink:#102e2b;--muted:#657873;--cream:#fbf8f2;--line:#dfe5df;--coral:#ed6b4d;--mint:#9fd8c8;--yellow:#f2ca68;all:initial;font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Segoe UI",system-ui,sans-serif;color:var(--ink)}
    *,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button{touch-action:manipulation} [hidden]{display:none!important}
    .fab{position:fixed;z-index:2147483000;right:max(22px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom));height:58px;padding:0 22px;border:0;border-radius:999px;background:var(--ink);color:white;font-weight:800;font-size:14px;letter-spacing:.1px;cursor:pointer;box-shadow:0 15px 40px rgba(16,46,43,.28);display:flex;align-items:center;gap:11px;transition:transform .2s,box-shadow .2s}
    .fab:hover{transform:translateY(-3px);box-shadow:0 19px 42px rgba(16,46,43,.34)}.fab:focus-visible{outline:3px solid white;box-shadow:0 0 0 6px var(--coral)}.fab svg{width:19px}
    .backdrop{position:fixed;z-index:2147483001;inset:0;background:rgba(9,31,28,.55);backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px;opacity:0;visibility:hidden;transition:opacity .22s,visibility .22s}
    .backdrop.open{opacity:1;visibility:visible}.modal{width:min(980px,100%);height:min(720px,calc(100dvh - 36px));background:#fff;border-radius:28px;box-shadow:0 28px 80px rgba(5,26,23,.3);display:grid;grid-template-columns:238px 1fr;overflow:hidden;transform:translateY(18px) scale(.98);transition:transform .28s cubic-bezier(.2,.8,.2,1)}.open .modal{transform:none}
    .side{background:var(--ink);color:white;padding:32px 28px;display:flex;flex-direction:column}.logo{display:flex;align-items:center;gap:10px;font-family:"Manrope",system-ui,sans-serif;font-weight:800;font-size:14px;letter-spacing:-.2px}.widget-logo{width:38px;height:38px;object-fit:cover;border-radius:10px;background:#f6f1e8;box-shadow:0 5px 14px rgba(0,0,0,.16)}
    .steps{list-style:none;padding:0;margin:64px 0 0}.step-link{display:flex;gap:12px;align-items:flex-start;padding:0 0 29px;position:relative;color:#829b96;font-size:12px;font-weight:600}.step-link:not(:last-child):after{content:"";position:absolute;left:13px;top:29px;width:1px;height:27px;background:#31504b}.step-number{width:27px;height:27px;border:1px solid #45635e;border-radius:50%;display:grid;place-items:center;flex:none;font-size:11px;transition:.2s}.step-link.active{color:#fff}.step-link.active .step-number{background:var(--coral);border-color:var(--coral)}.step-link.done .step-number{background:var(--mint);border-color:var(--mint);color:var(--ink)}.step-name{display:block;font-size:13px;color:inherit;margin-bottom:3px}.step-sub{font-weight:400;color:#718985;font-size:10px}
    .side-help{margin-top:auto;padding:15px;border-radius:14px;background:#193c37;color:#a9c0bb;font-size:11px;line-height:1.5}.side-help b{color:white;display:block;margin-bottom:3px}
    .main{min-width:0;min-height:0;display:flex;flex-direction:column;background:#fff}
    .topbar{min-height:72px;flex:none;display:flex;align-items:center;padding:14px 25px;border-bottom:1px solid #edf0ec;gap:10px}
    .demo-pill{color:#54706a;background:#edf7f3;border-radius:999px;padding:7px 11px;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
    .lang-toggle{display:inline-flex;align-items:center;gap:4px;background:#f3f7f5;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:11px;font-weight:700;color:var(--muted);cursor:pointer;margin-left:auto;margin-right:2px;transition:all .18s}
    .lang-toggle:hover{background:#e7f0ec;color:var(--ink);border-color:#b9cfc7}
    .lang-opt{color:var(--muted);transition:color .18s}
    .lang-opt.active{color:var(--ink);font-weight:800}
    .lang-sep{color:#9cb1ac;font-size:10px}
    .close{width:44px;height:44px;border:0;border-radius:50%;background:#f4f4f0;color:var(--ink);cursor:pointer;font-size:23px;display:grid;place-items:center;flex:none}.close:hover{background:#e8ece7}.close:focus-visible,.back:focus-visible,.next:focus-visible,.choice:focus-visible,.time:focus-visible,.day:focus-visible,input:focus-visible,.lang-toggle:focus-visible{outline:3px solid rgba(237,107,77,.3);outline-offset:2px}
    .content{min-height:0;padding:34px clamp(26px,5vw,56px) 20px;overflow:auto;flex:1 1 auto;scrollbar-width:thin}.pane{animation:rise .28s ease both}@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.kicker{margin:0 0 8px;color:var(--coral);font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}.title{font:800 clamp(28px,3vw,38px)/1.08 "Manrope",system-ui,sans-serif;letter-spacing:-1.4px;margin:0}.subtitle{margin:11px 0 25px;color:var(--muted);font-size:14px;line-height:1.55}
    .section-label{display:block;margin:22px 0 10px;font-size:12px;font-weight:800;color:#34534e}.branch-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.choice{border:1px solid var(--line);background:#fff;border-radius:15px;padding:13px;text-align:left;color:var(--ink);cursor:pointer;min-height:83px;position:relative;transition:.18s}.choice:hover{border-color:#8bb8ac;transform:translateY(-1px)}.choice.selected{border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}.choice.selected:after{content:"✓";position:absolute;right:9px;top:9px;width:19px;height:19px;border-radius:50%;background:var(--ink);color:white;font-size:11px;display:grid;place-items:center}.badge{width:29px;height:29px;border-radius:9px;display:grid;place-items:center;font-size:11px;font-weight:800;margin-bottom:9px}.mint{background:#d7eee7}.peach{background:#f8d9ca}.yellow{background:#f8ebbd}.blue{background:#d7e9ed}.lilac{background:#e8def1}.choice b{display:block;font-size:12px}.choice small{display:block;color:var(--muted);font-size:10px;margin-top:4px}.service-list{display:grid;gap:8px}.service{min-height:62px;padding:12px 16px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.service b{display:block;font-size:13px}.service small{display:block;color:var(--muted);font-size:11px;margin-top:2px}.service .duration{align-self:center;color:#768782;font-size:11px;font-weight:700;margin-right:24px;white-space:nowrap}
    .date-layout{display:grid;grid-template-columns:1.05fr .95fr;gap:28px}.month-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.month-head b{font-size:14px}.month-head button{width:35px;height:35px;border:1px solid var(--line);border-radius:50%;background:white;cursor:pointer}.week,.days{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;gap:4px}.week span{font-size:9px;color:#84928f;text-transform:uppercase;font-weight:800;padding:7px 0}.day{border:0;background:transparent;aspect-ratio:1;border-radius:50%;color:var(--ink);font-size:11px;cursor:pointer;position:relative}.day:not(.empty):not(:disabled):hover{background:#edf7f3}.day.selected{background:var(--ink)!important;color:white;font-weight:800}.day.today:after{content:"";position:absolute;bottom:4px;left:50%;width:3px;height:3px;background:var(--coral);border-radius:50%}.day:disabled{color:#c0c8c5;cursor:not-allowed}.slot-panel{border-left:1px solid var(--line);padding-left:25px}.slot-title{font-size:12px;font-weight:800;margin-bottom:13px}.slots{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.time{border:1px solid var(--line);background:white;color:var(--ink);padding:10px 5px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;transition:.15s}.time:hover{border-color:var(--ink)}.time.selected{background:var(--coral);border-color:var(--coral);color:white}.availability{display:flex;gap:6px;align-items:center;color:#6f827d;font-size:9px;margin-top:15px}.dot{width:6px;height:6px;background:#55a889;border-radius:50%}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:11px;font-weight:800;color:#34534e}.field input{width:100%;min-height:47px;border:1px solid var(--line);border-radius:11px;padding:0 13px;color:var(--ink);background:#fff}.field input:focus{border-color:var(--ink);outline:3px solid rgba(159,216,200,.35)}.field .error{font-size:10px;color:#b6432b;min-height:12px}.privacy{display:flex;gap:10px;background:#f6f8f4;border-radius:13px;padding:13px 15px;color:#64756f;font-size:10px;line-height:1.5}.privacy span{font-size:17px}.summary{margin-top:18px;padding:14px;border:1px solid var(--line);border-radius:13px;display:flex;gap:11px;align-items:center}.summary .cal{width:42px;height:42px;border-radius:10px;background:#f8d9ca;display:grid;place-items:center;font-size:17px}.summary b,.summary small{display:block}.summary b{font-size:12px}.summary small{font-size:10px;color:var(--muted);margin-top:3px}
    .footer{min-height:82px;flex:none;border-top:1px solid #edf0ec;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(26px,5vw,56px);gap:12px}.back{border:0;background:transparent;color:#5e736d;font-size:12px;font-weight:800;cursor:pointer;padding:13px 0}.next{border:0;border-radius:999px;background:var(--ink);color:white;padding:14px 21px;min-height:47px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 8px 18px rgba(16,46,43,.16);min-width:128px}.next:disabled{opacity:.35;cursor:not-allowed;box-shadow:none}.next:not(:disabled):hover{transform:translateY(-1px)}
    .success{text-align:center;max-width:530px;margin:0 auto;padding:9px 0}.check{width:78px;height:78px;border-radius:50%;display:grid;place-items:center;background:#dff3ea;color:#287b60;font-size:34px;margin:0 auto 21px;animation:pop .45s cubic-bezier(.2,1.5,.4,1)}@keyframes pop{from{transform:scale(.4);opacity:0}}.success .title{font-size:34px}.success-card{text-align:left;border:1px solid var(--line);border-radius:17px;padding:17px 18px;margin:23px 0 15px;display:grid;grid-template-columns:38px 1fr;gap:11px;background:#fffdf9}.success-card .cal{width:38px;height:38px;background:#f8d9ca;border-radius:10px;display:grid;place-items:center}.success-card b,.success-card small{display:block}.success-card b{font-size:13px;margin-bottom:5px}.success-card small{font-size:11px;color:var(--muted);line-height:1.5}.send-note{font-size:10px;color:#71817d;line-height:1.5;margin:0 auto 18px;max-width:410px}.actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}.action{display:inline-flex;align-items:center;gap:7px;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:11px 15px;color:var(--ink);font-size:11px;font-weight:800;background:white}.action.primary-action{background:var(--ink);color:white;border-color:var(--ink)}
    .toast{position:fixed;z-index:2147483002;left:50%;bottom:24px;transform:translate(-50%,20px);background:#102e2b;color:white;padding:12px 18px;border-radius:999px;font-size:11px;font-weight:700;opacity:0;visibility:hidden;transition:.2s;box-shadow:0 12px 35px rgba(0,0,0,.24)}.toast.show{opacity:1;visibility:visible;transform:translate(-50%,0)}
    @media(max-width:700px){
      .backdrop{padding:0;align-items:flex-end}
      .modal{position:relative;width:100%;height:min(92dvh,820px);max-height:92dvh;border-radius:24px 24px 0 0;display:flex;flex-direction:column;overflow:hidden}
      .modal:before{content:"";position:absolute;top:9px;left:50%;transform:translateX(-50%);width:40px;height:4px;border-radius:999px;background:#cfd7d3;z-index:20}
      .main{flex:1 1 auto;min-height:0;height:auto;display:flex;flex-direction:column}
      .side{display:none}
      .topbar{min-height:56px;padding:12px 16px 8px;gap:8px}
      .lang-toggle{padding:4px 9px;font-size:10.5px;margin-right:2px}
      .content{padding:14px 18px 20px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
      .title{font-size:22px;letter-spacing:-0.7px}
      .subtitle{font-size:13px;margin:5px 0 14px}
      .kicker{margin:0 0 4px;font-size:10px}
      .section-label{margin:12px 0 7px;font-size:11px}
      .branch-grid{grid-template-columns:1fr 1fr;gap:7px}
      .choice.branch{min-height:54px;padding:8px 10px;display:flex;align-items:center;gap:9px}
      .choice.branch .badge{width:26px;height:26px;margin-bottom:0;flex:none;font-size:10px}
      .choice.branch b{font-size:12px;line-height:1.2}
      .choice.branch small{font-size:9px;margin-top:1px}
      .choice.branch:last-child:nth-child(odd){grid-column:1 / -1}
      .service-list{gap:7px}
      .service{min-height:54px;padding:10px 14px;grid-template-columns:1fr auto;gap:10px}
      .service b{font-size:12px;line-height:1.25}
      .service small{font-size:10px;line-height:1.3}
      .service .duration{font-size:10px;margin-right:18px}
      .date-layout{grid-template-columns:1fr;gap:16px}
      .month-head{margin-bottom:8px}
      .month-head b{font-size:13px}
      .month-head button{width:32px;height:32px}
      .week span{font-size:8.5px;padding:5px 0}
      .day{font-size:12px}
      .slot-panel{border-left:0;border-top:1px solid var(--line);padding:16px 0 0}
      .slot-title{font-size:12px;font-weight:800;margin-bottom:10px}
      .slots{grid-template-columns:repeat(2,1fr);gap:8px}
      .time{padding:12px 6px;font-size:12px;font-weight:700;border-radius:10px}
      .form-grid{grid-template-columns:1fr;gap:10px}
      .field.full{grid-column:auto}
      .field label{font-size:11px}
      .field input{font-size:16px;min-height:46px;border-radius:10px;padding:0 12px}
      .privacy{padding:11px 12px;font-size:10px}
      .summary{margin-top:14px;padding:12px}
      .footer{min-height:68px;padding:10px 18px calc(10px + env(safe-area-inset-bottom))}
      .back{padding:10px 0;font-size:12px}
      .next{min-height:46px;padding:12px 20px;font-size:13px}
      .fab{height:54px;right:16px;bottom:max(16px,env(safe-area-inset-bottom));padding:0 18px}
      .check{width:62px;height:62px;font-size:26px;margin-bottom:14px}
      .success-card{padding:14px;margin:16px 0 12px}
      .actions{gap:8px;flex-direction:column}
      .action{width:100%;justify-content:center;padding:12px 16px;font-size:12px}
    }
    @media(max-width:390px){
      .branch-grid{grid-template-columns:1fr 1fr;gap:6px}
      .choice.branch{padding:7px 8px;min-height:50px}
      .content{padding-left:14px;padding-right:14px}
      .footer{padding-left:14px;padding-right:14px}
      .fab span{display:none}
      .fab{width:54px;padding:0;justify-content:center}
    }
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  `;

  let initialLang = "en";
  try {
    const saved = localStorage.getItem("chicco_lang");
    if (saved === "zh" || saved === "en") initialLang = saved;
  } catch (e) {}

  const state = {
    step: 0,
    branch: null,
    service: null,
    date: null,
    time: null,
    name: "",
    email: "",
    phone: "",
    lang: initialLang,
    lastFocus: null,
    liveSlots: null,
    slotsLoading: false,
    confirmation: null,
    bookingKey: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  };

  const host = document.createElement("div");
  host.id = "chicco-booking-widget";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>${css}</style>
    <button class="fab" aria-label="Book an eye exam">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2"/><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <span>Book an exam</span>
    </button>
    <div class="backdrop" aria-hidden="true">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <aside class="side">
          <div class="logo"><img class="widget-logo" src="${logoUrl}" alt="" /> CHICCO OPTICAL</div>
          <ol class="steps"></ol>
          <div class="side-help"><b class="help-label">Need a hand?</b><span class="help-desc">Call or text</span> <span class="coordinator-phone"></span></div>
        </aside>
        <main class="main">
          <header class="topbar">
            <span class="demo-pill">${config.apiBase ? "Live booking" : "Live demo"}</span>
            <button class="lang-toggle" type="button" aria-label="Switch language">
              <span class="lang-opt ${state.lang === "en" ? "active" : ""}" data-lang="en">EN</span>
              <span class="lang-sep">/</span>
              <span class="lang-opt ${state.lang === "zh" ? "active" : ""}" data-lang="zh">中文</span>
            </button>
            <button class="close" aria-label="Close booking dialog">×</button>
          </header>
          <div class="content"></div>
          <footer class="footer">
            <button class="back">← Back</button>
            <button class="next">Continue</button>
          </footer>
        </main>
      </section>
    </div>
    <div class="toast" role="status"></div>
  `;

  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => Array.from(root.querySelectorAll(selector));
  let monthOffset = 0;

  function t() { return I18N[state.lang] || I18N.en; }

  $(".coordinator-phone").textContent = formatPhone(config.sms);

  function esc(value) { return String(value || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
  function formatPhone(value) { const n = String(value).replace(/\D/g, ""); return n.length === 10 ? `${n.slice(0,3)}-${n.slice(3,6)}-${n.slice(6)}` : value; }
  function selectedBranch() {
    const b = BRANCHES.find(x => x.id === state.branch);
    if (!b) return null;
    const localized = t().branches[b.id] || {};
    return { ...b, name: localized.name || b.name, area: localized.area || b.area };
  }
  function selectedService() {
    const s = SERVICES.find(x => x.id === state.service);
    if (!s) return null;
    const localized = t().services[s.id] || {};
    return { ...s, name: localized.name || s.name, detail: localized.detail || s.detail, duration: localized.duration || s.duration };
  }
  function dateLabel() {
    if (!state.date) return "";
    const locale = state.lang === "zh" ? "zh-CN" : "en-CA";
    const options = state.lang === "zh"
      ? { year: "numeric", month: "long", day: "numeric", weekday: "long" }
      : { weekday: "long", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat(locale, options).format(new Date(`${state.date}T12:00:00`));
  }
  function isoLocal(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function to24Hour(time) { const match=String(time).match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);if(!match)return time;let hour=Number(match[1])%12;if(match[3]==="PM")hour+=12;return `${String(hour).padStart(2,"0")}:${match[2]}`; }
  function to12Hour(time) { const [hour,minute]=String(time).split(":").map(Number);return `${hour%12||12}:${String(minute).padStart(2,"0")} ${hour>=12?"PM":"AM"}`; }

  function open() {
    state.lastFocus = document.activeElement;
    $(".backdrop").classList.add("open"); $(".backdrop").setAttribute("aria-hidden","false"); document.documentElement.style.overflow = "hidden";
    render(); requestAnimationFrame(()=>$(".close").focus());
  }
  function close() {
    $(".backdrop").classList.remove("open"); $(".backdrop").setAttribute("aria-hidden","true"); document.documentElement.style.overflow = "";
    if (state.lastFocus?.focus) state.lastFocus.focus();
  }
  function toast(message) { const tEl=$(".toast");tEl.textContent=message;tEl.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>tEl.classList.remove("show"),2200); }

  function setLanguage(lang) {
    if (!I18N[lang] || state.lang === lang) return;
    state.lang = lang;
    try { localStorage.setItem("chicco_lang", lang); } catch (e) {}
    render();
  }

  function toggleLanguage() {
    const next = state.lang === "en" ? "zh" : "en";
    setLanguage(next);
    window.dispatchEvent(new CustomEvent("chicco:lang-change", { detail: { lang: next } }));
  }

  function render() {
    const currentT = t();
    // Update FAB and topbar texts
    $(".fab span").textContent = currentT.fab;
    $(".demo-pill").textContent = config.apiBase ? currentT.liveBooking : currentT.liveDemo;
    $(".close").setAttribute("aria-label", currentT.closeLabel);
    $(".help-label").textContent = currentT.needHelp;
    $(".help-desc").textContent = currentT.callText;

    // Update lang toggle active class
    $$(".lang-opt").forEach(el => {
      el.classList.toggle("active", el.dataset.lang === state.lang);
    });

    // Sidebar steps
    $(".steps").innerHTML = currentT.steps.map((s, i) =>
      `<li class="step-link ${i === state.step ? "active" : ""} ${i < state.step ? "done" : ""}" data-step="${i}"><span class="step-number">${i < state.step ? "✓" : i + 1}</span><span><b class="step-name">${s[0]}</b><span class="step-sub">${s[1]}</span></span></li>`
    ).join("");

    const content = $(".content");
    if (state.step === 0) content.innerHTML = visitPane();
    if (state.step === 1) content.innerHTML = datePane();
    if (state.step === 2) content.innerHTML = detailsPane();
    if (state.step === 3) content.innerHTML = successPane();

    $(".footer").hidden = state.step === 3;
    $(".back").hidden = state.step === 0 || state.step === 3;
    $(".next").hidden = state.step === 3;
    $(".back").textContent = currentT.back;
    $(".next").textContent = state.step === 2 ? currentT.confirmBooking : currentT.continue;
    $(".next").disabled = !canContinue();

    bindPane();
    content.scrollTop = 0;
  }

  function visitPane() {
    const currentT = t();
    return `
      <div class="pane">
        <p class="kicker">${currentT.step1Kicker}</p>
        <h1 class="title" id="booking-title">${currentT.step1Title}</h1>
        <p class="subtitle">${currentT.step1Sub}</p>
        <span class="section-label">${currentT.selectLocation}</span>
        <div class="branch-grid">
          ${BRANCHES.map(b => {
            const loc = currentT.branches[b.id] || b;
            return `<button class="choice branch ${state.branch === b.id ? "selected" : ""}" data-id="${b.id}" aria-pressed="${state.branch === b.id}"><span class="badge ${b.tone}">${b.icon}</span><b>${loc.name}</b><small>${loc.area}</small></button>`;
          }).join("")}
        </div>
        <span class="section-label">${currentT.whatCanWeHelp}</span>
        <div class="service-list">
          ${SERVICES.map((s, i) => {
            const srv = currentT.services[s.id] || s;
            return `<button class="choice service ${state.service === s.id ? "selected" : ""}" data-id="${s.id}" aria-pressed="${state.service === s.id}"><span><b>${srv.name}</b><small>${srv.detail}</small></span><span class="duration">${srv.duration}</span></button>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  function calendarData() {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const cells = Array(base.getDay()).fill(null).concat(Array.from({ length: days }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1)));
    return { base, cells };
  }

  function datePane() {
    const currentT = t();
    const { base, cells } = calendarData();
    const month = new Intl.DateTimeFormat(state.lang === "zh" ? "zh-CN" : "en-CA", { month: "long", year: "numeric" }).format(base);
    const today = isoLocal(new Date());
    const slots = slotsFor(state.date);

    const slotMarkup = !state.date
      ? `<p style="font-size:11px;color:#80908c;line-height:1.55;grid-column:1/-1">${currentT.selectDateFirst}</p>`
      : state.slotsLoading
      ? `<p style="font-size:11px;color:#80908c;line-height:1.55;grid-column:1/-1">${currentT.checkingSlots}</p>`
      : slots.length
      ? slots.map(ti => `<button class="time ${state.time === ti ? "selected" : ""}" data-time="${ti}" aria-pressed="${state.time === ti}">${ti}</button>`).join("")
      : `<p style="font-size:11px;color:#80908c;line-height:1.55;grid-column:1/-1">${currentT.noSlots}</p>`;

    return `
      <div class="pane">
        <p class="kicker">${currentT.step2Kicker}</p>
        <h1 class="title" id="booking-title">${currentT.step2Title}</h1>
        <p class="subtitle">${currentT.step2Sub(esc(selectedBranch()?.name))}</p>
        <div class="date-layout">
          <section>
            <div class="month-head">
              <button data-month="-1" aria-label="${currentT.prevMonth}" ${monthOffset === 0 ? "disabled" : ""}>‹</button>
              <b>${month}</b>
              <button data-month="1" aria-label="${currentT.nextMonth}">›</button>
            </div>
            <div class="week">
              ${currentT.weekdays.map(w => `<span>${w}</span>`).join("")}
            </div>
            <div class="days">
              ${cells.map(d => {
                if (!d) return `<span class="day empty"></span>`;
                const id = isoLocal(d);
                const disabled = id < today || d.getDay() === 0;
                return `<button class="day ${id === today ? "today" : ""} ${state.date === id ? "selected" : ""}" data-date="${id}" ${disabled ? "disabled" : ""} aria-label="${d.toDateString()}" aria-pressed="${state.date === id}">${d.getDate()}</button>`;
              }).join("")}
            </div>
          </section>
          <section class="slot-panel">
            <div class="slot-title">${state.date ? dateLabel() : currentT.slotSelectedTitle}</div>
            <div class="slots">${slotMarkup}</div>
            ${state.date && !state.slotsLoading ? `<div class="availability"><span class="dot"></span> ${currentT.liveChecked}</div>` : ""}
          </section>
        </div>
      </div>
    `;
  }

  function slotsFor(date) {
    if (!date) return [];
    if (config.apiBase && Array.isArray(state.liveSlots)) return state.liveSlots.map(to12Hour);
    const seed = [...date + state.branch + state.service].reduce((a, c) => a + c.charCodeAt(0), 0);
    const all = ["9:00 AM", "9:30 AM", "10:30 AM", "11:00 AM", "1:00 PM", "1:30 PM", "2:30 PM", "3:00 PM", "4:00 PM", "4:30 PM"];
    return all.filter((_, i) => (i + seed) % 4 !== 0).slice(0, 8);
  }

  function detailsPane() {
    const currentT = t();
    return `
      <div class="pane">
        <p class="kicker">${currentT.step3Kicker}</p>
        <h1 class="title" id="booking-title">${currentT.step3Title}</h1>
        <p class="subtitle">${currentT.step3Sub}</p>
        <form class="form-grid" novalidate>
          <div class="field full">
            <label for="patient-name">${currentT.fullName}</label>
            <input id="patient-name" name="name" autocomplete="name" placeholder="${currentT.namePlaceholder}" value="${esc(state.name)}"/>
            <span class="error" data-error="name"></span>
          </div>
          <div class="field">
            <label for="patient-email">${currentT.email}</label>
            <input id="patient-email" name="email" type="email" autocomplete="email" placeholder="${currentT.emailPlaceholder}" value="${esc(state.email)}"/>
            <span class="error" data-error="email"></span>
          </div>
          <div class="field">
            <label for="patient-phone">${currentT.mobile}</label>
            <input id="patient-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="${currentT.mobilePlaceholder}" value="${esc(state.phone)}"/>
            <span class="error" data-error="phone"></span>
          </div>
        </form>
        <div class="privacy">
          <span>♢</span>
          <div><b>${currentT.privacyTitle}</b><br/>${currentT.privacyText}</div>
        </div>
        <div class="summary">
          <span class="cal">◫</span>
          <span><b>${esc(selectedService()?.name)} · ${esc(selectedBranch()?.name)}</b><small>${dateLabel()} · ${esc(state.time)}</small></span>
        </div>
      </div>
    `;
  }

  function successPane() {
    const currentT = t();
    if (state.confirmation) {
      const links = state.confirmation.calendar || {};
      return `
        <div class="pane success">
          <div class="check">✓</div>
          <p class="kicker">${currentT.confirmedKicker}</p>
          <h1 class="title" id="booking-title">${currentT.bookedTitle(esc(state.name.split(" ")[0]))}</h1>
          <p class="subtitle">${currentT.emailSentTo(esc(state.email))}</p>
          <div class="success-card">
            <span class="cal">◫</span>
            <span>
              <b>${esc(selectedService()?.name)} · ${esc(selectedBranch()?.name)}</b>
              <small>${dateLabel()} · ${esc(state.time)}<br/>${currentT.bookingRef(esc(state.confirmation.appointment_id))}</small>
            </span>
          </div>
          <p class="send-note">${currentT.addCalendarPrompt}</p>
          <div class="actions">
            ${links.google ? `<a class="action primary-action" target="_blank" rel="noopener" href="${esc(links.google)}">${currentT.googleCal}</a>` : ""}
            ${links.outlook ? `<a class="action" target="_blank" rel="noopener" href="${esc(links.outlook)}">${currentT.outlookCal}</a>` : ""}
            ${links.ics ? `<a class="action" href="${esc(links.ics)}">${currentT.appleCal}</a>` : ""}
            <button class="action" data-close-dialog style="margin-top:6px;background:#102e2b;color:white;cursor:pointer">${currentT.done}</button>
          </div>
        </div>
      `;
    }

    const body = bookingText();
    const subject = encodeURIComponent(`New booking request — ${state.name} — ${dateLabel()}`);
    const smsBody = encodeURIComponent(body);
    const emailBody = encodeURIComponent(body);
    const start = new Date(`${state.date} ${state.time}`);
    const duration = selectedService()?.id === "adjustment" ? 20 : 45;
    const end = new Date(start.getTime() + duration * 60000);
    const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Chicco Optical — ${selectedService()?.name}`)}&dates=${calendarStamp(start)}/${calendarStamp(end)}&details=${encodeURIComponent(`Appointment at Chicco Optical ${selectedBranch()?.name}`)}&location=${encodeURIComponent(selectedBranch()?.area || "")}`;

    return `
      <div class="pane success">
        <div class="check">✓</div>
        <p class="kicker">${currentT.requestPreparedKicker}</p>
        <h1 class="title" id="booking-title">${currentT.readyTitle(esc(state.name.split(" ")[0]))}</h1>
        <p class="subtitle">This demo prepares the booking for the coordinator. Use either button below to send it.</p>
        <div class="success-card">
          <span class="cal">◫</span>
          <span>
            <b>${esc(selectedService()?.name)} · ${esc(selectedBranch()?.name)}</b>
            <small>${dateLabel()} · ${esc(state.time)}<br/>Confirmation to ${esc(state.email)} and ${esc(state.phone)}</small>
          </span>
        </div>
        <p class="send-note">Demo mode never silently sends your information. Your email or messaging app will open with the booking prefilled for review.</p>
        <div class="actions">
          <a class="action primary-action" href="mailto:${config.email}?subject=${subject}&body=${emailBody}">✉ Email booking</a>
          <a class="action" href="sms:${config.sms}?body=${smsBody}">▣ Text booking</a>
          <a class="action" target="_blank" rel="noopener" href="${cal}">${currentT.googleCal}</a>
          <button class="action" data-close-dialog style="margin-top:6px;background:#102e2b;color:white;cursor:pointer">${currentT.done}</button>
        </div>
      </div>
    `;
  }

  function calendarStamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function bookingText() {
    return `New Chicco Optical booking request\n\nPatient: ${state.name}\nEmail: ${state.email}\nMobile: ${state.phone}\nLocation: ${selectedBranch()?.name} (${selectedBranch()?.area})\nService: ${selectedService()?.name}\nDate: ${dateLabel()}\nTime: ${state.time}\n\nSubmitted from the Chicco booking demo.`;
  }
  function canContinue() {
    if (state.step === 0) return !!state.branch && !!state.service;
    if (state.step === 1) return !!state.date && !!state.time;
    if (state.step === 2) return valid(false);
    return false;
  }
  function valid(show = true) {
    const currentT = t();
    const goodName = state.name.trim().length >= 2;
    const goodEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    const digits = state.phone.replace(/\D/g, "");
    const goodPhone = digits.length >= 10 && digits.length <= 15;
    if (show) {
      const set = (k, m) => {
        const e = root.querySelector(`[data-error="${k}"]`);
        if (e) e.textContent = m;
      };
      set("name", goodName ? "" : currentT.errName);
      set("email", goodEmail ? "" : currentT.errEmail);
      set("phone", goodPhone ? "" : currentT.errPhone);
    }
    return goodName && goodEmail && goodPhone;
  }

  async function loadAvailability(date) {
    if (!config.apiBase) return;
    state.slotsLoading = true;
    state.liveSlots = null;
    render();
    try {
      const params = new URLSearchParams({ branch_id: state.branch, date, service_type: state.service });
      const response = await fetch(`${config.apiBase}/api/slots?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Availability could not be loaded.");
      state.liveSlots = result.slots || [];
    } catch (error) {
      state.liveSlots = [];
      toast(error.message || "Availability could not be loaded.");
    } finally {
      state.slotsLoading = false;
      render();
      if (window.innerWidth <= 700) {
        setTimeout(() => {
          const slotPanel = root.querySelector(".slot-panel");
          if (slotPanel) slotPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
    }
  }

  function bindPane() {
    $$(".branch").forEach(b => b.addEventListener("click", () => {
      state.branch = b.dataset.id;
      render();
      if (window.innerWidth <= 700) {
        setTimeout(() => {
          const serviceHeader = root.querySelector(".service-list");
          if (serviceHeader) serviceHeader.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 50);
      }
    }));
    $$(".service").forEach(b => b.addEventListener("click", () => { state.service = b.dataset.id; render(); }));
    $$("[data-month]").forEach(b => b.addEventListener("click", () => { monthOffset += Number(b.dataset.month); state.date = null; state.time = null; state.liveSlots = null; render(); }));
    $$("[data-date]").forEach(b => b.addEventListener("click", () => {
      state.date = b.dataset.date;
      state.time = null;
      state.liveSlots = null;
      if (config.apiBase) loadAvailability(state.date);
      else render();
      if (window.innerWidth <= 700) {
        setTimeout(() => {
          const slotPanel = root.querySelector(".slot-panel");
          if (slotPanel) slotPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
    }));
    $$("[data-time]").forEach(b => b.addEventListener("click", () => { state.time = b.dataset.time; render(); }));
    $$('input').forEach(input => input.addEventListener("input", () => { state[input.name] = input.value; $(".next").disabled = !canContinue(); }));
    $$("[data-close-dialog]").forEach(btn => btn.addEventListener("click", close));
  }

  async function continueFlow() {
    if (state.step === 2 && !valid(true)) return;
    if (!canContinue()) return;
    if (state.step === 2 && config.apiBase) {
      $(".next").disabled = true;
      $(".next").textContent = t().bookingPending;
      try {
        const res = await fetch(`${config.apiBase}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": state.bookingKey },
          body: JSON.stringify({
            branch_id: state.branch,
            patient_name: state.name,
            patient_email: state.email,
            patient_phone: state.phone,
            service_type: state.service,
            appointment_date: state.date,
            appointment_time: to24Hour(state.time),
            idempotency_key: state.bookingKey,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Booking failed.");
        state.confirmation = result;
      } catch (error) {
        toast(error.message || "Booking could not be confirmed.");
        $(".next").disabled = false;
        $(".next").textContent = t().confirmBooking;
        return;
      }
    }
    state.step++;
    render();
  }

  $(".fab").addEventListener("click", open);
  $(".close").addEventListener("click", close);
  $(".lang-toggle").addEventListener("click", toggleLanguage);
  $(".back").addEventListener("click", () => { state.step--; render(); });
  $(".next").addEventListener("click", continueFlow);
  $(".backdrop").addEventListener("click", e => { if (e.target === $(".backdrop")) close(); });
  document.addEventListener("click", e => { if (e.target.closest?.("[data-open-chicco-booking]")) { e.preventDefault(); open(); } });
  document.addEventListener("keydown", e => {
    if (!$(".backdrop").classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const focusable = $$('button:not([disabled]),input,a[href]').filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener("chicco:lang-change", (e) => {
    if (e.detail?.lang) setLanguage(e.detail.lang);
  });

  render();
  window.ChiccoBooking = { open, close, setLanguage, getLanguage: () => state.lang };
})();
