// Βιτρίνα: μεζονέτα με κήπο και πισίνα στη Βούλα (Άλυος 3, Ι2) – S.F. Properties.
// Ενεργοποιείται όταν το άρθρο έχει a.showcase === "voula". Όλα τα κείμενα εδώ, σε εβραϊκά και αγγλικά.
// Στοιχεία από τα σχέδια της άδειας: ισόγειο 75,90 · πατάρι 50,58 · υπόγειο Ι2 32,56 · κήπος Ι2 152,09 τ.μ.
// Αποστάσεις σε ευθεία γραμμή από την οδό Άλυος (OpenStreetMap).
import { esc, P, formBox } from "./templates.mjs";
import { SEA, ROAD } from "./voula-map.mjs";

const LISTING = "20184685";
const PRICE = 1230000;
const WA_TXT = { zh: "您好，我在 Yavanet 上看到了武拉带泳池的复式住宅，想了解详情", tr: "Merhaba, Yavanet'te Voula'daki havuzlu dubleksi gördüm, detayları öğrenmek isterim" };
const WA = (he, lang) => `https://wa.me/306906723676?text=${encodeURIComponent(WA_TXT[lang] || (he ? "שלום, ראיתי ביוונט את הדופלקס עם הבריכה בוולה ואשמח לקבל פרטים" : "Hi, I saw the Voula maisonette with pool on Yavanet and would like details"))}`;
const FONTS = "https://fonts.googleapis.com/css2?family=GFS+Didot&family=Playfair+Display:ital,wght@0,400;1,400&family=Frank+Ruhl+Libre:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap";

const HOME = [467, 549];
const SEA_PT = [442, 563];
// Σημεία στον χάρτη (συντεταγμένες viewBox)
const PTS = [
  { k: "beach", x: 393, y: 497, km: 0.7, he: "חוף וולה", en: "Voula Beach", tr: "Voula Plajı", zh: "武拉海滩", lx: -14, anchor: "end" },
  { k: "glyfada", x: 436, y: 349, km: 1.6, he: "מרכז גליפדה", en: "Glyfada centre", tr: "Glyfada merkezi", zh: "格利法达市中心", lx: 16, anchor: "start" },
  { k: "marina", x: 204, y: 199, km: 3.5, he: "מרינה גליפדה", en: "Glyfada Marina", tr: "Glyfada Marinası", zh: "格利法达游艇码头", lx: 16, anchor: "start" },
  { k: "astir", x: 651, y: 1067, km: 4.4, he: "Astir Beach", en: "Astir Beach", tr: "Astir Beach", zh: "Astir 海滩", lx: -16, anchor: "end", ly: -34 },
  { k: "lake", x: 786, y: 1087, km: 4.9, he: "אגם ווליאגמני", en: "Lake Vouliagmeni", tr: "Vouliagmeni Gölü", zh: "武利亚格梅尼湖", lx: -16, anchor: "end", ly: 52 },
];
// Φωτογραφίες περιοχής: Wikimedia Commons (ελεύθερες άδειες, με αναφορά δημιουργού)
const AREA = {
  v1: { src: "/voula-area-v1.jpg", by: "Mister No", lic: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Voula_-_panoramio_(9).jpg" },
  v2: { src: "/voula-area-v2.jpg", by: "Mister No", lic: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Voula_-_panoramio_(6).jpg" },
  lake: { src: "/voula-area-lake.jpg", by: "GeorgeBRAINiac", lic: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Vouliagmeni_lake.jpg" },
  astir: { src: "/voula-area-astir.jpg", by: "Vouliagmeni", lic: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Sunset_at_Astir_Beach,_Vouliagmeni,_Athens,_Greece.jpg" },
  marina: { src: "/voula-area-marina.jpg", by: "Mister No", lic: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Glyfada_Marina_-_panoramio_(6).jpg" },
};
const SWEEP = 6; // δευτερόλεπτα για έναν γύρο του ραντάρ
const angle = (p) => { const a = (Math.atan2(p.x - HOME[0], -(p.y - HOME[1])) * 180) / Math.PI; return (a + 360) % 360; };

const IC = {
  wa: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2.5 2.5 4.7 5 5l1.2-1.2-1.8-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-1.8z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;

const C = {
  he: {
    spons: "תוכן ממומן · S.F. Properties",
    eye: "הריביירה האתונאית · וולה",
    h1a: "בית גן עם",
    h1b: "בריכה משלו",
    dek: "דופלקס חדש, פחות מ-400 מטר מהים. סלון בגובה כפול שנפתח אל הבריכה, שלושה חדרי שינה וגינה פרטית של 152 מ\"ר.",
    price: "מחיר",
    gv: "מתאים לוויזת זהב",
    badge: "ויזת זהב · GOLDEN VISA · ",
    wa: "שלחו הודעה בוואטסאפ",
    see: "לראות את המיקום",
    areaEye: "החיים מסביב",
    areaH: "הים, הלגונה והמרינה, כמה דקות מהבית",
    area: [["v1","חוף וולה","700 מ׳"],["v2","קו החוף של וולה","פחות מ-400 מ׳"],["lake","אגם ווליאגמני","4.9 ק״מ"],["astir","שקיעה ב-Astir Beach","4.4 ק״מ"],["marina","מרינה גליפדה","3.5 ק״מ"]],
    locEye: "המיקום",
    locH: "הים ממש מעבר לפינה",
    locP: "הסורק מראה מה נמצא סביב הבית. המרחקים בקו אווירי מרחוב אליוס (Alyos).",
    sea: "הים",
    seaKm: "פחות מ-400 מ׳",
    house: "הבית",
    list: [["הים", "<400", "מ׳"], ["תחנת החשמלית Asklipieio Voulas", "600", "מ׳"], ["חוף וולה", "700", "מ׳"], ["מרכז גליפדה", "1.6", "ק״מ"], ["מרינה גליפדה", "3.5", "ק״מ"], ["Astir Beach, ווליאגמני", "4.4", "ק״מ"], ["אגם ווליאגמני", "4.9", "ק״מ"], ["פארק אליניקו", "5.8", "ק״מ"], ["סינטגמה, מרכז אתונה", "14.5", "ק״מ"], ["נמל התעופה של אתונה", "20", "ק״מ"]],
    factsH: "במספרים",
    facts: [["152", "מ\"ר", "גינה בשימוש בלעדי"], ["126.48", "מ\"ר", "שטח מגורים בשני מפלסים"], ["3", "", "חדרי שינה, שניים מהם במפלס העליון"], ["520", "מ\"ר", "מגרש עם שני בתים בלבד"]],
    galH: "אחרי השקיעה",
    galP: "גררו הצידה",
    gal: [["voula-facade", "הכניסה לבניין"], ["voula-facade-n", "הכניסה בערב"], ["voula-ext", "הבית והבריכה"], ["voula-ext-n", "הבית בערב"], ["voula-pool", "מרפסת הבריכה"], ["voula-pool-n", "הבריכה בערב"], ["voula-lounge", "סלון ומטבח פתוחים"], ["voula-lounge-n", "הסלון בערב"], ["voula-living", "סלון בגובה כפול"], ["voula-living-n", "הסלון בגובה כפול בערב"], ["voula-loft", "מבט מלמעלה על הסלון"], ["voula-kitchen", "מטבח עם אי"], ["voula-kitchen-n", "המטבח בערב"], ["voula-bedroom", "חדר השינה המאסטר, יציאה לגינה"], ["voula-bedroom-n", "חדר השינה המאסטר בערב"], ["voula-wardrobe", "חדר ארונות"], ["voula-bedroom2", "חדר שינה שני"], ["voula-bath", "חדר רחצה צמוד"], ["voula-bath2", "חדר רחצה שני"], ["voula-pergola", "פינת אוכל מתחת לפרגולה"], ["voula-pergola-n", "הפרגולה בערב"], ["voula-lawn", "הגינה הפרטית (הצעת שתילה)"], ["voula-lawn-n", "הגינה בערב (הצעת שתילה)"]],
    lvH: "שלושה מפלסים",
    lv: [["+2.95", "50.58", "מפלס עליון", "שני חדרי שינה, אחד מהם עם ארון הליכה פתוח וחדר רחצה פרטי, המשקיפים אל הסלון."], ["±0.00", "75.90", "קומת קרקע", "סלון בגובה כפול שנפתח אל הבריכה, מטבח עם אי, חדר שינה מאסטר עם חדר רחצה צמוד ויציאה לגינה."], ["מרתף", "32.56", "חלל עזר", "חדר משחקים, חדר כושר או חדר נוסף. חניה בחניון התת-קרקעי."]],
    gvEye: "ויזת זהב",
    gvH: "עומד בשני התנאים",
    gvP: "באטיקה, ויזת זהב דרך נדל\"ן דורשת לפחות 800,000 אירו בנכס אחד ושטחים עיקריים של 120 מ\"ר לפחות. מחסן וחניה לא נספרים.",
    g1: "מחיר", g1t: "סף: 800,000 €",
    g2: "שטחים עיקריים", g2t: "מינימום: 120 מ\"ר",
    gvNote: "השטחים לפי תוכניות ההיתר (קומת קרקע ומפלס עליון). מומלץ שעורך דין יאשר לפני החתימה.",
    gvGuide: "המדריך המלא לוויזת זהב",
    taxEye: "השעון מתקתק",
    taxH: "מס הרכישה עשוי לקפוץ פי חמישה",
    taxP: "יוון הודיעה על כוונה להעלות את מס העברת הנכס לקונים מחוץ לאיחוד האירופי מ-3% ל-15%, החל מ-1 בינואר 2027. נכון להיום זו הודעה ולא חוק.",
    today: "היום (3%)", from27: "מ-2027 (15%)", diff: "ההפרש",
    days: "ימים", hrs: "שעות", min: "דקות", sec: "שניות", until: "עד 1 בינואר 2027",
    ctaH: "בואו לראות אותו בשעת בין ערביים",
    ctaP: "שלחו לנו הודעה ונשלח מחיר, תוכניות מלאות ומועד לביקור. אפשר גם סיור בווידאו מישראל.",
    formH: "מעדיפים שנחזור אליכם?",
    formT: "השאירו פרטים ונחזור אליכם בעברית. גילוי נאות: הפנייה מגיעה ל-S.F. Properties (ספירידון פיקיאס, מתווך נדל״ן, ΓΕΜΗ 172090403000), המו״ל של יוונט.",
    excl: "המחיר אינו כולל ריהוט ואת הגינה המרוהטת והמעוצבת שמופיעה בתמונות. התמונות הן הדמיות להמחשה בלבד.",
    disc: "התמונות הן הדמיות. השטחים לפי תוכניות היתר הבנייה. המידע על ויזת הזהב ועל המס אינו ייעוץ משפטי. נתוני מפה © OpenStreetMap contributors.",
  },
  en: {
    spons: "Sponsored · S.F. Properties",
    eye: "Athenian Riviera · Voula",
    h1a: "A garden house",
    h1b: "with its own pool",
    dek: "A new-build maisonette under 400 m from the sea. A double-height living room opening onto the pool, three bedrooms and a 152 m² private garden.",
    price: "Price",
    gv: "Golden Visa eligible",
    badge: "GOLDEN VISA · ELIGIBLE · ",
    wa: "Message us on WhatsApp",
    see: "See the location",
    areaEye: "Life around the house",
    areaH: "The sea, the lagoon and the marina, minutes away",
    area: [["v1","Voula Beach","700 m"],["v2","The Voula coastline","under 400 m"],["lake","Lake Vouliagmeni","4.9 km"],["astir","Sunset at Astir Beach","4.4 km"],["marina","Glyfada Marina","3.5 km"]],
    locEye: "Location",
    locH: "The sea is just around the corner",
    locP: "The radar shows what surrounds the house. Straight-line distances from Alyos Street.",
    sea: "The sea",
    seaKm: "under 400 m",
    house: "The house",
    list: [["The sea", "<400", "m"], ["Asklipieio Voulas tram stop", "600", "m"], ["Voula Beach", "700", "m"], ["Glyfada centre", "1.6", "km"], ["Glyfada Marina", "3.5", "km"], ["Astir Beach, Vouliagmeni", "4.4", "km"], ["Lake Vouliagmeni", "4.9", "km"], ["Ellinikon Park", "5.8", "km"], ["Syntagma, central Athens", "14.5", "km"], ["Athens International Airport", "20", "km"]],
    factsH: "By the numbers",
    facts: [["152", "m²", "Exclusive-use garden"], ["126.48", "m²", "Living space on two levels"], ["3", "", "Bedrooms, two on the upper level"], ["520", "m²", "Plot shared by only two homes"]],
    galH: "After dusk",
    galP: "Swipe sideways",
    gal: [["voula-facade", "Building entrance"], ["voula-facade-n", "Entrance at night"], ["voula-ext", "The house and pool"], ["voula-ext-n", "The house at night"], ["voula-pool", "Pool terrace"], ["voula-pool-n", "The pool at night"], ["voula-lounge", "Open-plan living and kitchen"], ["voula-lounge-n", "Living room in the evening"], ["voula-living", "Double-height living room"], ["voula-living-n", "Double-height living, evening"], ["voula-loft", "The living room from above"], ["voula-kitchen", "Kitchen with island"], ["voula-kitchen-n", "The kitchen in the evening"], ["voula-bedroom", "Master bedroom, garden access"], ["voula-bedroom-n", "Master bedroom, evening"], ["voula-wardrobe", "Walk-in wardrobe"], ["voula-bedroom2", "Second bedroom"], ["voula-bath", "En-suite bathroom"], ["voula-bath2", "Second bathroom"], ["voula-pergola", "Dining under the pergola"], ["voula-pergola-n", "The pergola at night"], ["voula-lawn", "Private garden (planting proposal)"], ["voula-lawn-n", "The garden at night (planting proposal)"]],
    lvH: "Three levels",
    lv: [["+2.95", "50.58", "Upper level", "Two bedrooms, one with an open walk-in wardrobe and private bathroom, overlooking the living room."], ["±0.00", "75.90", "Ground floor", "Double-height living room opening onto the pool, kitchen with island, master bedroom with en-suite and garden door."], ["Basement", "32.56", "Auxiliary room", "Playroom, gym or extra room. Parking space in the basement garage."]],
    gvEye: "Golden Visa",
    gvH: "It meets both conditions",
    gvP: "In Attica, the real estate route to the Golden Visa needs at least €800,000 in a single property and at least 120 m² of main areas. Storage and parking do not count.",
    g1: "Price", g1t: "Threshold: €800,000",
    g2: "Main areas", g2t: "Minimum: 120 m²",
    gvNote: "Areas from the permit drawings (ground floor and upper level). Have a lawyer confirm before signing.",
    gvGuide: "Full Golden Visa guide",
    taxEye: "The clock is ticking",
    taxH: "The purchase tax may jump five-fold",
    taxP: "Greece has announced plans to raise the property transfer tax for non-EU buyers from 3% to 15% from 1 January 2027. As of today this is an announcement, not a law.",
    today: "Today (3%)", from27: "From 2027 (15%)", diff: "Difference",
    days: "days", hrs: "hours", min: "min", sec: "sec", until: "until 1 January 2027",
    ctaH: "Come and see it at dusk",
    ctaP: "Message us for the price, the full plans and a viewing. Video tours are available for buyers abroad.",
    formH: "Prefer that we call you?",
    formT: "Leave your details and we will get back to you. Disclosure: your request goes to S.F. Properties (Spyridon Fikias, real estate broker, ΓΕΜΗ 172090403000), Yavanet's publisher.",
    excl: "The price does not include furniture or the furnished, landscaped garden shown in the images. Images are visualizations for illustration only.",
    disc: "Images are visualizations. Areas from the building permit drawings. Golden Visa and tax information is not legal advice. Map data © OpenStreetMap contributors.",
  },
  zh: {
    spons: "赞助内容 · S.F. Properties",
    eye: "雅典里维埃拉 · 武拉 (Voula)",
    h1a: "自带泳池的",
    h1b: "花园别墅",
    dek: "全新复式住宅，距海不到400米。挑高客厅直通泳池，三间卧室，152平方米私家花园。",
    price: "价格",
    gv: "符合黄金签证条件",
    badge: "GOLDEN VISA · 黄金签证 · ",
    wa: "WhatsApp 联系我们",
    see: "查看位置",
    areaEye: "周边生活",
    areaH: "海滩、湖泊与游艇码头，近在咫尺",
    area: [["v1", "武拉海滩", "700米"], ["v2", "武拉海岸线", "不到400米"], ["lake", "武利亚格梅尼湖", "4.9公里"], ["astir", "Astir 海滩日落", "4.4公里"], ["marina", "格利法达游艇码头", "3.5公里"]],
    locEye: "位置",
    locH: "大海就在街角",
    locP: "雷达显示房子周边的一切。距离为从 Alyos 街起算的直线距离。",
    sea: "大海",
    seaKm: "不到400米",
    house: "房子",
    list: [["大海", "<400", "米"], ["Asklipieio Voulas 有轨电车站", "600", "米"], ["武拉海滩", "700", "米"], ["格利法达市中心", "1.6", "公里"], ["格利法达游艇码头", "3.5", "公里"], ["Astir 海滩，武利亚格梅尼", "4.4", "公里"], ["武利亚格梅尼湖", "4.9", "公里"], ["埃里尼孔公园", "5.8", "公里"], ["宪法广场，雅典市中心", "14.5", "公里"], ["雅典国际机场", "20", "公里"]],
    factsH: "数字一览",
    facts: [["152", "m²", "专属使用花园"], ["126.48", "m²", "两层居住面积"], ["3", "", "卧室，其中两间在上层"], ["520", "m²", "地块上仅有两栋住宅"]],
    galH: "日落之后",
    galP: "左右滑动",
    gal: [["voula-facade", "楼宇入口"], ["voula-facade-n", "夜间入口"], ["voula-ext", "住宅与泳池"], ["voula-ext-n", "夜色中的住宅"], ["voula-pool", "泳池露台"], ["voula-pool-n", "夜间泳池"], ["voula-lounge", "开放式客厅与厨房"], ["voula-lounge-n", "傍晚的客厅"], ["voula-living", "挑高客厅"], ["voula-living-n", "傍晚的挑高客厅"], ["voula-loft", "俯瞰客厅"], ["voula-kitchen", "岛台厨房"], ["voula-kitchen-n", "傍晚的厨房"], ["voula-bedroom", "主卧，直通花园"], ["voula-bedroom-n", "傍晚的主卧"], ["voula-wardrobe", "步入式衣帽间"], ["voula-bedroom2", "第二卧室"], ["voula-bath", "主卧卫浴"], ["voula-bath2", "第二卫浴"], ["voula-pergola", "凉棚下的餐区"], ["voula-pergola-n", "夜间凉棚"], ["voula-lawn", "私家花园（种植方案）"], ["voula-lawn-n", "夜间花园（种植方案）"]],
    lvEye: "房屋剖面",
    lvH: "三个楼层",
    lv: [["+2.95", "50.58", "上层", "两间卧室，其中一间带开放式衣帽间和独立卫浴，俯瞰客厅。"], ["±0.00", "75.90", "底层", "挑高客厅直通泳池，岛台厨房，主卧带独立卫浴并可直达花园。"], ["地下室", "32.56", "辅助空间", "可作游戏室、健身房或额外房间。地下车库内设专属车位。"]],
    gvEye: "黄金签证",
    gvH: "两项条件均符合",
    gvP: "在阿提卡大区，通过购房申请黄金签证，需在单一房产投资至少80万欧元，且主要面积不少于120平方米。储藏室和车位不计入。",
    g1: "价格", g1t: "门槛：800,000 €",
    g2: "主要面积", g2t: "最低：120 m²",
    gvNote: "面积依据建筑许可图纸（底层及上层）。签约前请由律师确认。",
    gvGuide: "黄金签证指南（英文）",
    taxEye: "时间紧迫",
    taxH: "购房税可能上涨至五倍",
    taxP: "希腊宣布计划自2027年1月1日起，将非欧盟买家的房产转让税从3%提高至15%。截至目前，这仍是政府公告，尚未成为法律。",
    today: "目前 (3%)", from27: "2027年起 (15%)", diff: "差额",
    days: "天", hrs: "小时", min: "分", sec: "秒", until: "距2027年1月1日",
    ctaH: "黄昏时分，来亲眼看看",
    ctaP: "联系我们获取完整图纸并预约看房。海外买家可安排视频看房。",
    formH: "希望我们联系您？",
    formT: "留下您的联系方式，我们将以英文回复。说明：您的请求将发送至 S.F. Properties（Spyridon Fikias，房地产经纪人，ΓΕΜΗ 172090403000）。",
    excl: "价格不含家具，也不含图片中已布置家具和绿化的花园。图片仅为效果示意。",
    disc: "图片为效果图。面积依据建筑许可图纸。黄金签证及税务信息不构成法律建议。地图数据 © OpenStreetMap 贡献者。",
  },
  tr: {
    spons: "Sponsorlu içerik · S.F. Properties",
    eye: "Atina Rivierası · Voula",
    h1a: "Kendi havuzu olan",
    h1b: "bahçeli bir ev",
    dek: "Denize 400 metreden kısa mesafede yeni yapı bir dubleks. Havuza açılan çift yükseklikte salon, üç yatak odası ve 152 m² özel bahçe.",
    price: "Fiyat",
    gv: "Golden Visa'ya uygun",
    badge: "GOLDEN VISA · UYGUN · ",
    wa: "WhatsApp'tan yazın",
    see: "Konumu görün",
    areaEye: "Evin çevresindeki hayat",
    areaH: "Deniz, göl ve marina, birkaç dakika uzakta",
    area: [["v1", "Voula Plajı", "700 m"], ["v2", "Voula sahili", "400 m'den az"], ["lake", "Vouliagmeni Gölü", "4,9 km"], ["astir", "Astir Beach'te gün batımı", "4,4 km"], ["marina", "Glyfada Marinası", "3,5 km"]],
    locEye: "Konum",
    locH: "Deniz hemen köşede",
    locP: "Radar, evin çevresinde neler olduğunu gösteriyor. Mesafeler Alyos Sokağı'ndan kuş uçuşu.",
    sea: "Deniz",
    seaKm: "400 m'den az",
    house: "Ev",
    list: [["Deniz", "<400", "m"], ["Asklipieio Voulas tramvay durağı", "600", "m"], ["Voula Plajı", "700", "m"], ["Glyfada merkezi", "1.6", "km"], ["Glyfada Marinası", "3.5", "km"], ["Astir Beach, Vouliagmeni", "4.4", "km"], ["Vouliagmeni Gölü", "4.9", "km"], ["Ellinikon Parkı", "5.8", "km"], ["Sintagma, Atina merkezi", "14.5", "km"], ["Atina Uluslararası Havalimanı", "20", "km"]],
    factsH: "Rakamlarla",
    facts: [["152", "m²", "Özel kullanımlı bahçe"], ["126.48", "m²", "İki katta yaşam alanı"], ["3", "", "Yatak odası, ikisi üst katta"], ["520", "m²", "Yalnızca iki evin bulunduğu arsa"]],
    galH: "Gün batımından sonra",
    galP: "Yana kaydırın",
    gal: [["voula-facade", "Bina girişi"], ["voula-facade-n", "Gece giriş"], ["voula-ext", "Ev ve havuz"], ["voula-ext-n", "Gece ev"], ["voula-pool", "Havuz terası"], ["voula-pool-n", "Gece havuz"], ["voula-lounge", "Açık plan salon ve mutfak"], ["voula-lounge-n", "Akşam salon"], ["voula-living", "Çift yükseklikte salon"], ["voula-living-n", "Akşam çift yükseklikte salon"], ["voula-loft", "Yukarıdan salon"], ["voula-kitchen", "Adalı mutfak"], ["voula-kitchen-n", "Akşam mutfak"], ["voula-bedroom", "Bahçeye çıkışlı ebeveyn yatak odası"], ["voula-bedroom-n", "Akşam ebeveyn yatak odası"], ["voula-wardrobe", "Giyinme odası"], ["voula-bedroom2", "İkinci yatak odası"], ["voula-bath", "Ebeveyn banyosu"], ["voula-bath2", "İkinci banyo"], ["voula-pergola", "Pergola altında yemek alanı"], ["voula-pergola-n", "Gece pergola"], ["voula-lawn", "Özel bahçe (bitkilendirme önerisi)"], ["voula-lawn-n", "Gece bahçe (bitkilendirme önerisi)"]],
    lvEye: "Evin kesiti",
    lvH: "Üç kat",
    lv: [["+2.95", "50.58", "Üst kat", "İki yatak odası; biri açık giyinme odalı ve kendi banyolu, salona bakıyor."], ["±0.00", "75.90", "Zemin kat", "Havuza açılan çift yükseklikte salon, adalı mutfak, banyolu ve bahçeye çıkışlı ebeveyn yatak odası."], ["Bodrum", "32.56", "Yardımcı alan", "Oyun odası, spor salonu veya ek oda. Kapalı otoparkta park yeri."]],
    gvEye: "Golden Visa",
    gvH: "İki şartı da karşılıyor",
    gvP: "Attika'da gayrimenkul yoluyla Golden Visa için tek bir mülke en az 800.000 € yatırım ve en az 120 m² ana alan gerekir. Depo ve otopark sayılmaz.",
    g1: "Fiyat", g1t: "Eşik: 800.000 €",
    g2: "Ana alanlar", g2t: "Asgari: 120 m²",
    gvNote: "Alanlar ruhsat çizimlerine göredir (zemin kat ve üst kat). İmzadan önce bir avukata teyit ettirin.",
    gvGuide: "Golden Visa rehberi (İngilizce)",
    taxEye: "Zaman daralıyor",
    taxH: "Tapu vergisi beş katına çıkabilir",
    taxP: "Yunanistan, AB dışından alıcılar için tapu devir vergisini 1 Ocak 2027'den itibaren %3'ten %15'e çıkarmayı planladığını açıkladı. Bugün itibarıyla bu bir açıklamadır, henüz yasa değildir.",
    today: "Bugün (%3)", from27: "2027'den itibaren (%15)", diff: "Fark",
    days: "gün", hrs: "saat", min: "dk", sec: "sn", until: "1 Ocak 2027'ye kadar",
    ctaH: "Gün batımında gelip görün",
    ctaP: "Bize yazın; tam çizimleri gönderelim ve ziyaret ayarlayalım. Türkiye'den video ile uzaktan tur da mümkün.",
    formH: "Sizi arayalım mı?",
    formT: "Bilgilerinizi bırakın, size İngilizce dönüş yapalım. Bilgilendirme: talebiniz S.F. Properties'e (Spyridon Fikias, emlak danışmanı, ΓΕΜΗ 172090403000) iletilir.",
    excl: "Fiyata mobilyalar ve görsellerdeki mobilyalı, peyzajı yapılmış bahçe dahil değildir. Görseller yalnızca temsilidir.",
    disc: "Görseller tasarım çalışmasıdır. Alanlar inşaat ruhsatı çizimlerine göredir. Golden Visa ve vergi bilgileri hukuki tavsiye değildir. Harita verileri © OpenStreetMap katkıda bulunanlar.",
  },
};

const eur = (n, he) => (he ? n.toLocaleString("en-US") + " €" : "€" + n.toLocaleString("en-US"));

function radarMap(lang) {
  const he = lang === "he", c = C[lang];
  const dots = PTS.map((p) => {
    const d = ((angle(p) / 360) * SWEEP).toFixed(2);
    const tx = p.x + p.lx, ty = p.y + (p.ly || 6);
    return `<g class="vx-poi" style="--d:${d}s"><circle class="vx-poi-glow" cx="${p.x}" cy="${p.y}" r="22"/><circle class="vx-poi-dot" cx="${p.x}" cy="${p.y}" r="9"/><text x="${tx}" y="${ty}" text-anchor="${p.anchor}" class="vx-poi-t">${esc(p[lang])}</text><text x="${tx}" y="${ty + 36}" text-anchor="${p.anchor}" class="vx-poi-k">${p.km} ${he ? "ק״מ" : "km"}</text></g>`;
  }).join("");
  return `<svg class="vx-map" viewBox="140 160 760 1030" role="img" aria-label="${esc(c.locH)}">
<defs>
  <radialGradient id="vxGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#E9B56C" stop-opacity=".55"/><stop offset="1" stop-color="#E9B56C" stop-opacity="0"/></radialGradient>
  <linearGradient id="vxSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9B56C" stop-opacity="0"/><stop offset="1" stop-color="#E9B56C" stop-opacity=".38"/></linearGradient>
  <pattern id="vxGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ECE5D8" stroke-opacity=".05"/></pattern>
</defs>
<rect x="0" y="0" width="1100" height="1400" fill="#1A2F3F"/>
<path d="${SEA}" fill="#08121A"/>
<rect x="0" y="0" width="1100" height="1400" fill="url(#vxGrid)"/>
<path d="${ROAD}" fill="none" stroke="#35506A" stroke-width="3"/>
${[127, 380, 632].map((r, i) => `<circle class="vx-ring" cx="${HOME[0]}" cy="${HOME[1]}" r="${r}" fill="none" stroke="#E9B56C" stroke-opacity="${[0.55, 0.35, 0.22][i]}" stroke-width="2" stroke-dasharray="5 9"/>`).join("")}
<text class="vx-ring-t" x="${HOME[0] + 6}" y="${HOME[1] - 133}">1 ${he ? "ק״מ" : "km"}</text>
<text class="vx-ring-t" x="${HOME[0] + 6}" y="${HOME[1] - 386}">3 ${he ? "ק״מ" : "km"}</text>
<g class="vx-sweep"><path d="M${HOME[0]} ${HOME[1]}L${HOME[0]} ${HOME[1] - 700}A700 700 0 0 1 ${HOME[0] + 700 * Math.sin(Math.PI / 4)} ${HOME[1] - 700 * Math.cos(Math.PI / 4)}Z" fill="url(#vxSweep)" transform="rotate(-45 ${HOME[0]} ${HOME[1]})"/><line x1="${HOME[0]}" y1="${HOME[1]}" x2="${HOME[0]}" y2="${HOME[1] - 700}" stroke="#E9B56C" stroke-opacity=".8" stroke-width="2"/></g>
<line class="vx-sea-line" x1="${HOME[0]}" y1="${HOME[1]}" x2="${SEA_PT[0]}" y2="${SEA_PT[1]}" stroke="#74D3D8" stroke-width="3" stroke-dasharray="4 6"/>
<text class="vx-sea-t" x="${SEA_PT[0] - 14}" y="${SEA_PT[1] + 34}" text-anchor="end">${esc(c.seaKm)}</text>
${dots}
<circle class="vx-pulse" cx="${HOME[0]}" cy="${HOME[1]}" r="30" fill="none" stroke="#E9B56C" stroke-width="3"/>
<circle class="vx-pulse vx-pulse2" cx="${HOME[0]}" cy="${HOME[1]}" r="30" fill="none" stroke="#E9B56C" stroke-width="3"/>
<circle cx="${HOME[0]}" cy="${HOME[1]}" r="46" fill="url(#vxGlow)"/>
<circle cx="${HOME[0]}" cy="${HOME[1]}" r="12" fill="#E9B56C"/>
<text class="vx-home-t" x="${HOME[0] + 26}" y="${HOME[1] - 18}">${esc(c.house)}</text>
<text class="vx-gulf" x="190" y="760">${lang === "zh" ? "萨罗尼克湾" : lang === "tr" ? "Saronik Körfezi" : he ? "המפרץ הסרוני" : "Saronic Gulf"}</text>
</svg>`;
}

// Φόρμα επικοινωνίας στη γλώσσα της σελίδας (tr/zh): το formBox έχει μόνο he/en, οπότε μεταφράζουμε τις ετικέτες
// και δίνουμε στο app.js τα μηνύματα επιτυχίας/σφάλματος μέσω data-ok / data-bad / data-err.
const FORM_L = {
  tr: { "Full name<": "Ad Soyad<", "Email<": "E-posta<", "Your message<": "Mesajınız<",
    "I agree that my details are used to reply to this request, under the privacy policy.": "Bilgilerimin bu talebe yanıt vermek için gizlilik politikası kapsamında kullanılmasını kabul ediyorum.",
    ">Privacy policy<": ">Gizlilik politikası<", ">Send<": ">Gönder<",
    ok: "Gönderildi. En kısa sürede size dönüş yapacağız.", bad: "Lütfen adınızı, geçerli bir e-posta adresi girin ve onay kutusunu işaretleyin.", err: "Gönderilemedi. Lütfen birazdan tekrar deneyin." },
  zh: { "Full name<": "姓名<", "Email<": "电子邮箱<", "Phone / WhatsApp<": "电话 / WhatsApp<", "Your message<": "您的留言<",
    "I agree that my details are used to reply to this request, under the privacy policy.": "我同意根据隐私政策使用我的信息回复此次咨询。",
    ">Privacy policy<": ">隐私政策<", ">Send<": ">发送<",
    ok: "已发送，我们会尽快与您联系。", bad: "请填写姓名和有效的电子邮箱，并勾选同意。", err: "发送失败，请稍后再试。" },
};
function localForm(lang, html) {
  const m = FORM_L[lang]; if (!m) return html;
  let out = html;
  for (const [k, v] of Object.entries(m)) if (!["ok", "bad", "err"].includes(k)) out = out.split(k).join(v);
  return out.replace('<form class="form"', `<form class="form" data-ok="${esc(m.ok)}" data-bad="${esc(m.bad)}" data-err="${esc(m.err)}"`);
}

const PORTRAIT = new Set(["voula-wardrobe", "voula-bath", "voula-bath2"]);

export function voulaShowcase(a, lang) {
  const he = lang === "he", c = C[lang];
  const wa = WA(he, lang);
  const waBtn = (cls, where) => `<a class="vx-btn vx-wa${cls}" href="${esc(wa)}" target="_blank" rel="noopener" data-out="wa-voula-${where}">${icon("wa")}<span>${esc(c.wa)}</span></a>`;
  const tax3 = PRICE * 0.03, tax15 = PRICE * 0.15;
  return `<link rel="stylesheet" href="${FONTS}">${lang === "zh" ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap">` : ""}
<style>${CSS}</style>
<article class="vx" lang="${lang}" data-listing="${LISTING}">

<header class="vx-hero">
  <div class="vx-hero-bg" style="background-image:url('/voula-hero.jpg')"></div>
  <div class="vx-hero-in">
    <span class="vx-eye"><i></i>${esc(c.eye)} <em>${esc(c.spons)}</em></span>
    <h1><span class="vx-l1">${esc(c.h1a)}</span><span class="vx-l2">${esc(c.h1b)}</span></h1>
    <p class="vx-dek">${esc(c.dek)}</p>
    <div class="vx-price"><small>${esc(c.price)}</small><b data-count="${PRICE}" data-fmt="eur">${eur(PRICE, he)}</b><em class="vx-excl">${esc(c.excl)}</em></div>
    <div class="vx-ctas">${waBtn("", "hero")}<a class="vx-btn vx-ghost" href="#vx-loc">${esc(c.see)}${icon("arrow")}</a></div>
  </div>
  <a class="vx-badge" href="#vx-gv" aria-label="${esc(c.gv)}">
    <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="vxCirc" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs><text><textPath href="#vxCirc">${esc(c.badge.repeat(3))}</textPath></text></svg>
    <span><b>✓</b>${esc(c.gv)}</span>
  </a>
</header>

<section class="vx-loc" id="vx-loc">
  <div class="vx-loc-map">${radarMap(lang)}</div>
  <div class="vx-loc-txt">
    <span class="vx-kick">${esc(c.locEye)}</span>
    <h2>${esc(c.locH)}</h2>
    <p class="vx-muted">${esc(c.locP)}</p>
    <ol class="vx-dist">${c.list.map(([n, v, u], i) => `<li data-rv style="--i:${i}"><span>${esc(n)}</span><b>${v.startsWith("<") ? esc(v) : `<span data-count="${v}" data-dec="${v.includes(".") ? 1 : 0}">${v}</span>`} <small>${esc(u)}</small></b></li>`).join("")}</ol>
  </div>
</section>

<section class="vx-area">
  <div class="vx-head"><span class="vx-kick">${esc(c.areaEye)}</span><h2>${esc(c.areaH)}</h2></div>
  <div class="vx-mosaic">
    ${c.area.map(([k, t, km], i) => { const x = AREA[k]; return `<figure class="vx-tile vx-t${i}" data-rv style="--i:${i}"><img src="${x.src}" alt="${esc(t)}" loading="lazy" referrerpolicy="no-referrer"><figcaption><b>${esc(t)}</b><em>${esc(km)}</em></figcaption><a class="vx-cred" href="${x.url}" target="_blank" rel="noopener">© ${esc(x.by)} · ${esc(x.lic)}</a></figure>`; }).join("")}
  </div>
</section>

<section class="vx-facts">
  ${c.facts.map(([n, u, l], i) => `<div class="vx-fact" data-rv style="--i:${i}"><b><span data-count="${n}" data-dec="${n.includes(".") ? 2 : 0}">${n}</span>${u ? `<small>${esc(u)}</small>` : ""}</b><span>${esc(l)}</span></div>`).join("")}
</section>

<section class="vx-gal" id="vx-photos">
  <div class="vx-head"><span class="vx-kick">${esc(c.galP)} →</span><h2>${esc(c.galH)}</h2></div>
  <div class="vx-strip" tabindex="0">
    ${c.gal.map(([f, cap], i) => { const p = PORTRAIT.has(f); return `<figure data-rv${p ? ' class="vx-p"' : ""} style="--i:${i}"><img src="/${f}.jpg" alt="${esc(cap)}" loading="lazy" width="${p ? 900 : 1600}" height="${p ? 1200 : 1067}"><figcaption><em>${String(i + 1).padStart(2, "0")}</em>${esc(cap)}</figcaption></figure>`; }).join("")}
  </div>
</section>

<section class="vx-lv" id="vx-plan">
  <div class="vx-head"><span class="vx-kick">${esc(c.lvEye || (he ? "חתך הבית" : "Section through the house"))}</span><h2>${esc(c.lvH)}</h2></div>
  <div class="vx-stack">
    ${c.lv.map(([el, ar, t, d], i) => `<div class="vx-slab vx-slab${i}" data-rv style="--i:${i}"><span class="vx-el">${esc(el)}</span><div><b><span data-count="${ar}" data-dec="2">${ar}</span><small>${he ? "מ\"ר" : "m²"}</small></b><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join("")}
  </div>
</section>

<section class="vx-gv" id="vx-gv">
  <div class="vx-head"><span class="vx-kick">${esc(c.gvEye)}</span><h2>${esc(c.gvH)}</h2><p class="vx-muted">${esc(c.gvP)}</p></div>
  <div class="vx-gauges">
    <div class="vx-gauge" data-rv><div class="vx-g-top"><span>${esc(c.g1)}</span><b data-count="${PRICE}" data-fmt="eur">${eur(PRICE, he)}</b></div><div class="vx-bar"><i style="--to:100%"></i><em style="--at:${((800000 / PRICE) * 100).toFixed(1)}%"><span>${esc(c.g1t)}</span></em></div><span class="vx-ok">✓ +${Math.round((PRICE / 800000 - 1) * 100)}%</span></div>
    <div class="vx-gauge" data-rv style="--i:1"><div class="vx-g-top"><span>${esc(c.g2)}</span><b><span data-count="126.48" data-dec="2">126.48</span> ${he ? "מ\"ר" : "m²"}</b></div><div class="vx-bar"><i style="--to:100%"></i><em style="--at:${((120 / 126.48) * 100).toFixed(1)}%"><span>${esc(c.g2t)}</span></em></div><span class="vx-ok">✓ +6.48 ${he ? "מ\"ר" : "m²"}</span></div>
  </div>
  <p class="vx-note">${esc(c.gvNote)} <a href="${P(lang, "/a/golden-visa-greece-2026-guide/")}">${esc(c.gvGuide)} →</a></p>
</section>

<section class="vx-tax">
  <div class="vx-head"><span class="vx-kick">${esc(c.taxEye)}</span><h2>${esc(c.taxH)}</h2><p class="vx-muted">${esc(c.taxP)}</p></div>
  <div class="vx-clock" data-until="2027-01-01T00:00:00+02:00" aria-label="${esc(c.until)}">
    ${[["d", c.days], ["h", c.hrs], ["m", c.min], ["s", c.sec]].map(([k, l]) => `<div><b data-k="${k}">--</b><span>${esc(l)}</span></div>`).join("")}
    <small>${esc(c.until)}</small>
  </div>
  <div class="vx-taxes">
    <div data-rv><span>${esc(c.today)}</span><b data-count="${tax3}" data-fmt="eur">${eur(tax3, he)}</b></div>
    <div data-rv style="--i:1" class="vx-hot"><span>${esc(c.from27)}</span><b data-count="${tax15}" data-fmt="eur">${eur(tax15, he)}</b></div>
    <div data-rv style="--i:2"><span>${esc(c.diff)}</span><b data-count="${tax15 - tax3}" data-fmt="eur">${eur(tax15 - tax3, he)}</b></div>
  </div>
</section>

<section class="vx-cta">
  <h2>${esc(c.ctaH)}</h2>
  <p>${esc(c.ctaP)}</p>
  <div class="vx-ctas">${waBtn(" vx-big", "cta")}</div>
  <span class="vx-phone">+30 690 672 3676 · info@sfproperties.gr</span>
</section>

<div class="vx-form">${localForm(lang, formBox(lang === "tr" || lang === "zh" ? "en" : lang, { id: "lead-voula", kind: "property-lead", fields: ["name", "phone", "email", "msg"], title: c.formH, text: c.formT }))}</div>
<p class="vx-disc">${esc(c.excl)} ${esc(c.disc.replace(/^[^.。]*[.。]\s*/, ""))}</p>
</article>
<a class="vx-float" href="${esc(wa)}" target="_blank" rel="noopener" data-out="wa-voula-float" aria-label="${esc(c.wa)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.6-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg><span>${esc(c.wa)}</span></a>
<script>${JS}</script>`;
}

const CSS = `
.vx{--n:#0B1620;--n2:#11222F;--n3:#1A2F3F;--ink:#ECE5D8;--dim:#9FAAAD;--gold:#E9B56C;--gold2:#F6D9A4;--pool:#74D3D8;--line:rgba(236,229,216,.13);
  --disp:"GFS Didot","Frank Ruhl Libre",Didot,"Times New Roman",serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  background:var(--n);color:var(--ink);border-radius:28px;overflow:hidden;margin:8px 0 28px;position:relative;isolation:isolate}
.vx:lang(he){--disp:"Frank Ruhl Libre","GFS Didot",serif}
.vx:lang(tr){--disp:"Playfair Display",Georgia,serif}
.vx:lang(zh){--disp:"Noto Serif SC","Songti SC","SimSun",serif}
.vx:lang(zh) .vx-l2{font-style:normal;font-weight:600}
.vx:lang(zh) .vx-kick,.vx:lang(zh) .vx-eye{letter-spacing:.08em}
.vx:lang(zh) h1,.vx:lang(zh) h2{letter-spacing:.02em}
.vx *{box-sizing:border-box}
.vx h1,.vx h2,.vx h3{font-family:var(--disp);font-weight:400;color:var(--ink);letter-spacing:-.01em}
.vx:lang(he) h1,.vx:lang(he) h2{font-weight:300}
.vx a{color:inherit}
.vx section{padding:clamp(48px,8vw,96px) clamp(18px,5vw,64px);position:relative}
.vx-kick{font:500 12px/1 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.vx:lang(he) .vx-kick{letter-spacing:.06em;font-family:inherit;font-weight:700;font-size:14px}
.vx-head{display:grid;gap:12px;margin-bottom:clamp(24px,4vw,40px);max-width:680px}
.vx-head h2,.vx-loc h2,.vx-cta h2{font-size:clamp(34px,5.6vw,58px);line-height:1.05}
.vx-muted{color:var(--dim);font-size:17px;line-height:1.6}
.vx-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;font-weight:700;font-size:16px;text-decoration:none;transition:transform .25s,box-shadow .35s,background .25s}
.vx-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.vx-wa{background:var(--gold);color:#0B1620!important;box-shadow:0 0 0 0 rgba(233,181,108,.5);animation:vxBeat 2.8s ease-in-out infinite}
.vx-wa:hover{transform:translateY(-2px);box-shadow:0 18px 50px -12px rgba(233,181,108,.7)}
.vx-ghost{border:1px solid var(--line);color:var(--ink)!important}
.vx-ghost:hover{border-color:var(--gold);color:var(--gold)!important}
[dir=rtl] .vx-btn svg[aria-hidden] path[d^="M5 12"]{transform:scaleX(-1);transform-origin:center}
.vx-big{font-size:18px;padding:18px 30px}
@keyframes vxBeat{0%,70%,100%{box-shadow:0 0 0 0 rgba(233,181,108,.45)}35%{box-shadow:0 0 0 14px rgba(233,181,108,0)}}

/* hero */
.vx-hero{position:relative;min-height:clamp(560px,82vh,760px);display:flex;align-items:flex-end;padding:clamp(22px,5vw,64px);overflow:hidden}
.vx-hero-bg{position:absolute;inset:-4%;background-size:cover;background-position:center 78%;animation:vxKen 26s ease-in-out infinite alternate;z-index:-2}
.vx-hero::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(11,22,32,.25) 0%,rgba(11,22,32,.35) 35%,rgba(11,22,32,.96) 88%)}
@keyframes vxKen{from{transform:scale(1) translate(0,0)}to{transform:scale(1.1) translate(-2%,-2%)}}
.vx-hero-in{display:grid;gap:18px;max-width:760px}
.vx-eye{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font:500 12px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--gold2)}
.vx:lang(he) .vx-eye{letter-spacing:.04em;font-family:inherit;font-size:14px;font-weight:700}
.vx-eye i{width:28px;height:1px;background:var(--gold)}
.vx-eye em{font-style:normal;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:4px 10px;letter-spacing:.08em}
.vx-hero h1{font-size:clamp(46px,9.5vw,112px);line-height:.95;display:grid}
.vx-l1,.vx-l2{display:block;animation:vxRise 1.1s cubic-bezier(.2,.8,.2,1) both}
.vx-l2{font-style:italic;color:var(--gold);animation-delay:.18s}
.vx:lang(he) .vx-l2{font-style:normal;font-weight:500}
@keyframes vxRise{from{opacity:.001;transform:translateY(40px);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
.vx-dek{font-size:clamp(17px,2.2vw,20px);line-height:1.55;color:#D3D6D2;max-width:56ch}
.vx-price{display:grid;gap:4px}
.vx-excl{font-size:13px;line-height:1.45;font-weight:400;font-style:normal;color:#C9B48F;max-width:34ch;margin-top:6px}
.vx-price small{font:500 12px var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.vx-price b{font:400 clamp(40px,7vw,72px)/1 var(--disp);color:var(--ink);font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate;justify-self:start}
.vx-ctas{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.vx-badge{position:absolute;top:clamp(18px,4vw,40px);inset-inline-end:clamp(18px,4vw,40px);width:clamp(120px,17vw,168px);aspect-ratio:1;display:grid;place-items:center;text-decoration:none;filter:drop-shadow(0 18px 30px rgba(0,0,0,.45))}
.vx-badge svg{position:absolute;inset:0;width:100%;height:100%;animation:vxSpin 18s linear infinite}
.vx-badge text{font:500 15.5px var(--mono);letter-spacing:.18em;fill:var(--gold2)}
.vx-badge::before{content:"";position:absolute;inset:16%;border-radius:50%;background:radial-gradient(circle at 30% 25%,#F6D9A4,#E9B56C 45%,#A87528);box-shadow:inset 0 2px 6px rgba(255,255,255,.4),inset 0 -6px 12px rgba(0,0,0,.25)}
.vx-badge span{position:relative;display:grid;place-items:center;gap:2px;text-align:center;color:#0B1620;font-weight:800;font-size:clamp(11px,1.4vw,13px);line-height:1.15;max-width:62%}
.vx-badge b{font-size:22px;line-height:1}
.vx-badge:hover svg{animation-duration:4s}
@keyframes vxSpin{to{transform:rotate(360deg)}}

/* location */
.vx-loc{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(24px,5vw,64px);align-items:center;background:radial-gradient(800px 500px at 20% 40%,rgba(116,211,216,.07),transparent 60%),var(--n)}
.vx-loc-map{position:relative;border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:0 40px 80px -40px rgba(0,0,0,.8)}
.vx-map{display:block;width:100%;height:auto;max-height:78vh;direction:ltr}
.vx-sweep{transform-origin:${HOME[0]}px ${HOME[1]}px;transform-box:view-box;animation:vxSpin ${SWEEP}s linear infinite}
.vx-pulse{transform-origin:${HOME[0]}px ${HOME[1]}px;transform-box:view-box;animation:vxPulse 2.6s ease-out infinite}
.vx-pulse2{animation-delay:1.3s}
@keyframes vxPulse{from{transform:scale(.6);opacity:.9}to{transform:scale(4.2);opacity:0}}
.vx-poi-dot{fill:var(--pool)}
.vx-poi-glow{fill:var(--pool);opacity:0;transform-box:fill-box;transform-origin:center;animation:vxPing ${SWEEP}s linear infinite;animation-delay:var(--d)}
@keyframes vxPing{0%{opacity:.8;transform:scale(.4)}12%{opacity:0;transform:scale(1.8)}100%{opacity:0;transform:scale(1.8)}}
.vx-poi-t{font:600 34px "Frank Ruhl Libre",Georgia,serif;fill:var(--ink);paint-order:stroke;stroke:#0B1620;stroke-width:6px}
.vx-poi-k{font:500 26px var(--mono);fill:var(--pool);paint-order:stroke;stroke:#0B1620;stroke-width:5px}
.vx-home-t{font:700 40px "Frank Ruhl Libre",Georgia,serif;fill:var(--gold);paint-order:stroke;stroke:#0B1620;stroke-width:6px}
.vx-ring-t{font:500 24px var(--mono);fill:var(--gold);opacity:.8}
.vx-sea-line{animation:vxDash 1.2s linear infinite}
@keyframes vxDash{to{stroke-dashoffset:-20}}
.vx-sea-t{font:600 28px var(--mono);fill:var(--pool);paint-order:stroke;stroke:#08121A;stroke-width:6px}
.vx-gulf{font:italic 30px "GFS Didot",Georgia,serif;fill:#4F6B80;letter-spacing:.08em}
.vx-loc-txt{display:grid;gap:14px;min-width:0}
.vx-dist{list-style:none;margin:10px 0 0;padding:0;display:grid}
.vx-dist li{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:12px 0;border-bottom:1px solid var(--line);font-size:16px}
.vx-dist li:first-child{color:var(--pool);font-weight:700}
.vx-dist b{font:500 18px var(--mono);white-space:nowrap;font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate}
.vx-dist b small{color:var(--dim);font-size:13px}

/* area photos */
.vx-area{background:var(--n)}
.vx-mosaic{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:clamp(150px,18vw,230px);gap:12px}
.vx-tile{position:relative;margin:0;border-radius:18px;overflow:hidden;background:var(--n3)}
.vx-t0{grid-column:span 4;grid-row:span 2}.vx-t1{grid-column:span 2}.vx-t2{grid-column:span 2}.vx-t3{grid-column:span 3}.vx-t4{grid-column:span 3}
.vx-tile img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.08);transition:transform 1.6s cubic-bezier(.2,.8,.2,1)}
.vx-tile.in img{transform:scale(1)}
.vx-tile:hover img{transform:scale(1.06)}
.vx-tile::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(11,22,32,.85));pointer-events:none}
.vx-tile figcaption{position:absolute;inset-inline:16px;bottom:14px;z-index:1;display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.vx-tile figcaption b{font:400 clamp(20px,2.4vw,28px)/1.1 var(--disp);color:var(--ink)}
.vx-tile figcaption em{font:500 13px var(--mono);font-style:normal;color:var(--pool);white-space:nowrap;direction:ltr;unicode-bidi:isolate}
.vx-cred{position:absolute;top:10px;inset-inline-end:10px;z-index:1;font:500 10px var(--mono);color:rgba(236,229,216,.7)!important;background:rgba(11,22,32,.55);padding:3px 7px;border-radius:999px;text-decoration:none}

/* facts */
.vx-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-block:1px solid var(--line);padding-block:0!important}
.vx-fact{padding:clamp(22px,4vw,40px) clamp(10px,2vw,22px);display:grid;gap:8px;border-inline-start:1px solid var(--line)}
.vx-fact:first-child{border-inline-start:0}
.vx-fact b{font:400 clamp(38px,5.6vw,64px)/1 var(--disp);color:var(--gold);font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate;justify-self:start}
.vx-fact b small{font:500 15px var(--mono);color:var(--dim);margin-inline-start:6px}
.vx-fact>span{color:var(--dim);font-size:15px}

@media (max-width:760px){.vx-hero-bg{background-position:74% 70%}}
/* gallery */
.vx-gal{background:linear-gradient(180deg,var(--n),var(--n2))}
.vx-strip{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:18px;margin-inline:calc(-1 * clamp(18px,5vw,64px));padding-inline:clamp(18px,5vw,64px);scrollbar-width:thin;scrollbar-color:var(--n3) transparent}
.vx-strip figure{margin:0;flex:0 0 auto;width:min(84vw,calc(clamp(230px,40vw,420px) * 1.5));scroll-snap-align:center;display:grid;gap:12px;align-content:start}
.vx-strip figure.vx-p{width:calc(clamp(230px,40vw,420px) * .75)}
.vx-strip img{width:100%;height:clamp(230px,40vw,420px);object-fit:cover;border-radius:16px;display:block;transition:transform .6s cubic-bezier(.2,.8,.2,1),filter .6s}
.vx-strip figure:hover img{transform:scale(1.03) rotate(-.6deg);filter:brightness(1.1)}
.vx-strip figcaption{display:flex;gap:10px;color:var(--dim);font-size:15px}
.vx-strip figcaption em{font:500 13px var(--mono);font-style:normal;color:var(--gold)}

/* levels */
.vx-lv{background:var(--n2)}
.vx-stack{display:grid;gap:14px;perspective:1200px}
.vx-slab{display:grid;grid-template-columns:120px minmax(0,1fr);gap:20px;align-items:center;padding:24px 26px;border-radius:20px;background:linear-gradient(120deg,rgba(233,181,108,.10),rgba(233,181,108,.02));border:1px solid rgba(233,181,108,.22);transform-origin:center top}
.vx-slab1{background:linear-gradient(120deg,rgba(233,181,108,.22),rgba(233,181,108,.04));border-color:rgba(233,181,108,.45)}
.vx-slab2{background:linear-gradient(120deg,rgba(116,211,216,.10),rgba(116,211,216,.02));border-color:rgba(116,211,216,.25)}
.vx-el{font:500 15px var(--mono);color:var(--gold);direction:ltr;unicode-bidi:isolate}
.vx-slab2 .vx-el{color:var(--pool)}
.vx-slab b{font:400 clamp(34px,5vw,52px)/1 var(--disp);font-variant-numeric:tabular-nums}
.vx-slab b small{font:500 14px var(--mono);color:var(--dim);margin-inline-start:6px}
.vx-slab h3{font-size:22px;margin:8px 0 4px}
.vx-slab p{color:var(--dim);margin:0;line-height:1.5}

/* golden visa */
.vx-gv{background:radial-gradient(700px 400px at 85% 10%,rgba(233,181,108,.16),transparent 60%),var(--n)}
.vx-gauges{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.vx-gauge{padding:24px;border-radius:20px;background:var(--n2);border:1px solid var(--line);display:grid;gap:18px}
.vx-g-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;color:var(--dim)}
.vx-g-top b{font:400 clamp(26px,3.6vw,36px) var(--disp);color:var(--ink);direction:ltr;unicode-bidi:isolate;font-variant-numeric:tabular-nums}
.vx-bar{position:relative;height:14px;border-radius:999px;background:var(--n3);margin-bottom:26px}
.vx-bar i{position:absolute;inset-block:0;inset-inline-start:0;width:0;border-radius:999px;background:linear-gradient(90deg,#A87528,var(--gold),var(--gold2));transition:width 1.8s cubic-bezier(.2,.8,.2,1) .2s;box-shadow:0 0 24px rgba(233,181,108,.45)}
.vx-gauge.in .vx-bar i{width:var(--to)}
.vx-bar em{position:absolute;inset-block:-6px;inset-inline-start:var(--at);width:2px;background:var(--ink);font-style:normal}
.vx-bar em span{position:absolute;top:28px;inset-inline-start:0;transform:translateX(-50%);white-space:nowrap;font:500 12px var(--mono);color:var(--dim)}
[dir=rtl] .vx-bar em span{transform:translateX(50%)}
.vx-ok{font:500 14px var(--mono);color:var(--pool);direction:ltr;unicode-bidi:isolate;justify-self:start}
.vx-note{color:var(--dim);margin:20px 0 0;font-size:15px}
.vx-note a{color:var(--gold);font-weight:700}

/* tax */
.vx-tax{background:var(--n2)}
.vx-clock{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;margin-bottom:28px;direction:ltr}
.vx-clock>div{min-width:96px;padding:16px 14px;border-radius:16px;background:var(--n);border:1px solid var(--line);display:grid;gap:4px;text-align:center}
.vx-clock b{font:400 clamp(34px,5vw,52px)/1 var(--disp);font-variant-numeric:tabular-nums;color:var(--ink)}
.vx-clock span,.vx-clock small{font:500 12px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.vx:lang(he) .vx-clock span{font-family:inherit;letter-spacing:0;font-size:14px}
.vx-clock small{align-self:center;flex-basis:100%}
.vx:lang(he) .vx-clock small{direction:rtl;text-align:right;font-family:inherit;letter-spacing:0;font-size:14px}
.vx-taxes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.vx-taxes>div{padding:22px;border-radius:18px;border:1px solid var(--line);display:grid;gap:8px}
.vx-taxes span{color:var(--dim);font-size:15px}
.vx-taxes b{font:400 clamp(26px,3.6vw,38px)/1 var(--disp);font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate;justify-self:start}
.vx-hot{background:linear-gradient(135deg,rgba(224,119,90,.18),rgba(233,181,108,.06));border-color:rgba(224,119,90,.45)!important}
.vx-hot b{color:#F2A585}

/* cta */
.vx-cta{text-align:center;display:grid;justify-items:center;gap:18px;background:radial-gradient(600px 300px at 50% 0%,rgba(233,181,108,.18),transparent 70%),var(--n)}
.vx-cta p{color:var(--dim);max-width:54ch;font-size:18px;margin:0}
.vx-phone{font:500 14px var(--mono);color:var(--dim);user-select:all;direction:ltr}
.vx-form{padding:0 clamp(18px,5vw,64px) 24px}
.vx-form .form{background:var(--n2);color:var(--ink);border-color:var(--line)}
.vx-disc{padding:0 clamp(18px,5vw,64px) 28px;color:#7C8A90;font-size:13px;margin:0}

/* πλωτό WhatsApp, πάντα ορατό (αντικαθιστά το γενικό του site σε αυτή τη σελίδα) */
.wafloat{display:none!important}
.vx-float{position:fixed;z-index:60;inset-inline-end:calc(18px + env(safe-area-inset-right,0px));bottom:calc(84px + env(safe-area-inset-bottom,0px));display:inline-flex;align-items:center;gap:10px;padding:12px 18px 12px 14px;border-radius:999px;background:#25D366;color:#fff!important;font:700 15px/1 system-ui,-apple-system,sans-serif;text-decoration:none;box-shadow:0 14px 34px -10px rgba(0,0,0,.55),0 0 0 0 rgba(37,211,102,.55);animation:vxWa 2.6s ease-in-out infinite}
.vx-float svg{width:26px;height:26px;flex:none}
.vx-float:hover{transform:translateY(-2px)}
@keyframes vxWa{0%,70%,100%{box-shadow:0 14px 34px -10px rgba(0,0,0,.55),0 0 0 0 rgba(37,211,102,.5)}35%{box-shadow:0 14px 34px -10px rgba(0,0,0,.55),0 0 0 14px rgba(37,211,102,0)}}
@media (max-width:560px){.vx-float span{display:none}.vx-float{padding:14px}}

/* reveal */
.vx [data-rv]{opacity:1;transform:none;transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i,0) * 90ms)}
.vx.vx-js [data-rv]:not(.in){opacity:.001;transform:translateY(28px)}
.vx.vx-js .vx-slab[data-rv]:not(.in){transform:rotateX(-38deg) translateY(30px)}

@media (max-width:820px){
  .vx-loc{grid-template-columns:minmax(0,1fr)}
  .vx-facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vx-fact:nth-child(3){border-inline-start:0}
  .vx-fact:nth-child(-n+2){border-bottom:1px solid var(--line)}
  .vx-gauges,.vx-taxes{grid-template-columns:minmax(0,1fr)}
  .vx-mosaic{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:170px}
  .vx-t0{grid-column:span 2;grid-row:span 2}.vx-t1,.vx-t2{grid-column:span 1}.vx-t3,.vx-t4{grid-column:span 2}
  .vx-slab{grid-template-columns:minmax(0,1fr);gap:8px}
  .vx-hero{min-height:620px}
  .vx-badge{width:116px}
  .vx-hero-in{padding-top:120px}
  .vx-eye{padding-inline-end:0}
}
@media (prefers-reduced-motion:reduce){.vx *{animation:none!important;transition:none!important}.vx.vx-js [data-rv]:not(.in){opacity:1;transform:none}.vx-bar i{width:var(--to)}}
`;

const JS = `(function(){
var root=document.querySelector(".vx");if(!root)return;
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var he=root.lang==="he";
function fmt(n,el){var dec=+(el.getAttribute("data-dec")||0);if(el.getAttribute("data-fmt")==="eur"){var s=Math.round(n).toLocaleString("en-US");return he?s+" €":"€"+s}return n.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function count(el){var to=parseFloat(el.getAttribute("data-count"));if(isNaN(to)||reduce)return;var t0=null,dur=1600+Math.min(1200,to/1000);function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur);var e=1-Math.pow(1-p,4);el.textContent=fmt(to*e,el);if(p<1)requestAnimationFrame(step);else el.textContent=fmt(to,el)}el.textContent=fmt(0,el);requestAnimationFrame(step)}
if(!("IntersectionObserver" in window))return;
root.classList.add("vx-js");
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add("in");if(e.target.hasAttribute("data-count"))count(e.target);e.target.querySelectorAll&&e.target.querySelectorAll("[data-count]").forEach(function(c){if(!c.closest("[data-rv]")||c.closest("[data-rv]")===e.target)count(c)})})},{threshold:.25,rootMargin:"0px 0px -6% 0px"});
root.querySelectorAll("[data-rv]").forEach(function(el){io.observe(el)});
root.querySelectorAll("[data-count]").forEach(function(el){if(!el.closest("[data-rv]"))io.observe(el)});
var ck=root.querySelector(".vx-clock");if(ck){var end=new Date(ck.getAttribute("data-until")).getTime();var B={};ck.querySelectorAll("b").forEach(function(b){B[b.getAttribute("data-k")]=b});
function tick(){var s=Math.max(0,Math.floor((end-Date.now())/1000));B.d.textContent=Math.floor(s/86400);B.h.textContent=String(Math.floor(s%86400/3600)).padStart(2,"0");B.m.textContent=String(Math.floor(s%3600/60)).padStart(2,"0");B.s.textContent=String(s%60).padStart(2,"0")}tick();setInterval(tick,1000)}
var strip=root.querySelector(".vx-strip");if(strip&&!reduce){var hint=true;var so=new IntersectionObserver(function(es){if(es[0].isIntersecting&&hint){hint=false;so.disconnect();strip.scrollBy({left:he?-120:120,behavior:"smooth"});setTimeout(function(){strip.scrollBy({left:he?120:-120,behavior:"smooth"})},700)}},{threshold:.6});so.observe(strip)}
})();`;

// Μπάρα ταυτότητας για τις σελίδες /tr/ και /zh/ (εκεί κρύβεται το μενού του Yavanet).
const TOP = {
  tr: { site: "Yavanet · Yunanistan'dan haberler ve gayrimenkul", firm: "S.F. Properties, Atina", about: "Hakkımızda", lines: ["S.F. Properties, Atina'da gayrimenkul satışı ve mülk yönetimi yapan bir şirkettir.", "Spyridon Fikias, emlak danışmanı · ΓΕΜΗ 172090403000", "Ofis: P. P. Germanou 77, Filothei 15237, Atina"] },
  zh: { site: "Yavanet · 希腊新闻与房产", firm: "S.F. Properties，雅典", about: "关于我们", lines: ["S.F. Properties 是一家位于雅典的房地产销售与物业管理公司。", "Spyridon Fikias，房地产经纪人 · ΓΕΜΗ 172090403000", "办公室：P. P. Germanou 77, Filothei 15237, 雅典"] },
};
export function voulaTopBar(lang) {
  const c = TOP[lang]; if (!c) return "";
  return `<style>
.vxt{position:sticky;top:env(safe-area-inset-top,0px);z-index:40;margin:0 0 10px;background:rgba(11,22,32,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(236,229,216,.12);border-radius:16px;color:#ECE5D8}
.vxt summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;cursor:pointer}
.vxt summary::-webkit-details-marker{display:none}
.vxt-l{display:flex;align-items:center;gap:12px;min-width:0}
.vxt img{height:20px;width:auto;flex:none}
.vxt-s{font:500 12px/1.3 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.04em;color:#A3ADAE;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vxt-a{font:600 13px/1 system-ui,sans-serif;color:#E9B56C;white-space:nowrap;border:1px solid rgba(233,181,108,.4);border-radius:999px;padding:6px 12px}
.vxt[open] .vxt-a{background:#E9B56C;color:#0B1620}
.vxt-b{padding:4px 16px 14px;display:grid;gap:6px;font-size:14px;line-height:1.5;color:#C9CFCF;border-top:1px solid rgba(236,229,216,.08)}
.vxt-b b{color:#ECE5D8}
.vxt-b a{color:#E9B56C}
.vxt-c{font:500 13px "IBM Plex Mono",ui-monospace,monospace;direction:ltr;unicode-bidi:isolate}
@media (max-width:560px){.vxt-s{display:none}}
</style>
<details class="vxt" lang="${lang}">
  <summary><span class="vxt-l"><img src="/sf-logo-light.png" alt="S.F. Properties" width="900" height="142"><span class="vxt-s">${esc(c.site)}</span></span><span class="vxt-a">${esc(c.about)}</span></summary>
  <div class="vxt-b"><b>${esc(c.firm)}</b>${c.lines.map((l) => `<span>${esc(l)}</span>`).join("")}<span class="vxt-c">info@sfproperties.gr · +30 690 672 3676 · <a href="https://sfproperties.gr/" target="_blank" rel="noopener">sfproperties.gr</a></span></div>
</details>`;
}
