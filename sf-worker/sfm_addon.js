// ===== Mobile home (≤760px): editorial black — S.F. Properties =====
const SFM_LANGS = ['el', 'en', 'tr', 'he', 'ar', 'zh', 'ru', 'fr', 'de', 'it'];
const SFM_U = (id, w, h) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&q=68&w=' + w + (h ? '&h=' + h : '');
const SFM_P = { buy: 'photo-1606917454663-343e58811bb1', rent: 'photo-1782113326479-b450da6c86d9', off: 'photo-1635752807994-212f7d1e678b', how: 'photo-1789737272550-f6c39aafa85b' };
const SFM_MEDIA = 'https://sfproperties.gr/_bp/';
const SFM_THEME = 'ivory';
const SFM_HERO = 1;
const SFM_HV = [{ v: 'sfm-hero', lay: 'bottom', t: 0 }, { v: 'sfm-h1', lay: 'bottom', t: 1 }, { v: 'sfm-h2', lay: 'center', t: 2 }, { v: 'sfm-h3', lay: 'top', t: 3 }];
const SFM_HT = {
  el: ['', 'Το σπίτι σας<br>στην Ελλάδα.', 'Πίσω από κάθε πόρτα,<br>μια νέα αρχή.', 'Ακίνητα<br>που ξεχωρίζουν.', 'Δείτε ακίνητα'],
  en: ['', 'Your home<br>in Greece.', 'Behind every door,<br>a new beginning.', 'Properties<br>that stand apart.', 'View properties'],
  he: ['', 'הבית שלכם<br>ביוון.', 'מאחורי כל דלת,<br>התחלה חדשה.', 'נכסים<br>יוצאי דופן.', 'לנכסים'],
  tr: ['', 'Yunanistan’daki<br>eviniz.', 'Her kapının ardında<br>yeni bir başlangıç.', 'Ayrıcalıklı<br>mülkler.', 'Mülkleri gör'],
  ar: ['', 'بيتكم<br>في اليونان.', 'خلف كل باب<br>بداية جديدة.', 'عقارات<br>استثنائية.', 'تصفّح العقارات'],
  zh: ['', '您在希腊的<br>家。', '每一扇门后，<br>都是新的开始。', '与众不同的<br>房产。', '浏览房源'],
  ru: ['', 'Ваш дом<br>в Греции.', 'За каждой дверью —<br>новое начало.', 'Недвижимость,<br>которая выделяется.', 'Смотреть объекты'],
  fr: ['', 'Votre maison<br>en Grèce.', 'Derrière chaque porte,<br>un nouveau départ.', 'Des biens<br>d’exception.', 'Voir les biens'],
  de: ['', 'Ihr Zuhause<br>in Griechenland.', 'Hinter jeder Tür<br>ein neuer Anfang.', 'Immobilien<br>der besonderen Art.', 'Immobilien ansehen'],
  it: ['', 'La vostra casa<br>in Grecia.', 'Dietro ogni porta,<br>un nuovo inizio.', 'Immobili<br>d’eccezione.', 'Vedi immobili']
};
const SFM_T = {
  el: { h1: 'Ακίνητα,<br>με προσωπική<br>φροντίδα.', sub: 'Πωλήσεις, ενοικιάσεις, βίλες και διαχείριση ακινήτων στην Αθήνα και στα νησιά. Σε 10 γλώσσες.', buy: 'Αγορά', rent: 'Ενοικίαση', villas: 'Βίλες', private: 'Off-market', q_l: 'Τι ψάχνετε;', q_h: 'Διαλέξτε<br>από πού ξεκινάτε.', buy_s: 'Κατοικίες · Μεζονέτες · Βίλες', rent_s: 'Μακροχρόνια', gv_d: 'Ακίνητα που πληρούν τα κριτήρια άδειας διαμονής.', gv_c: 'Οδηγός', own: 'Έχετε<br>ακίνητο;', own_d: 'Πώληση, ενοικίαση ή διαχείριση και Airbnb.', own_c: 'Ανάθεση', yacht_s: 'Σκάφη προς πώληση', off_h: 'Εκτός<br>αγοράς.', off_p: 'Πολλά από τα ακίνητά μας δεν δημοσιεύονται. Τα παρουσιάζουμε κατ’ ιδίαν, σε όσους ζητήσουν πρόσβαση.', off_c: 'Ζητήστε πρόσβαση', col_l: 'Διαθέσιμα τώρα', col_h: 'Η συλλογή', all: 'Όλα', sale: 'Προς πώληση', rentm: 'Ενοικίαση', ask: 'Ρωτήστε τιμή', month: '/μήνα', s1: 'Διαθέσιμα τώρα', s2: 'Έχουν νοικιαστεί', s3: 'Έχουν πουληθεί', how_l: 'Πώς δουλεύουμε', how_h: 'Ένας υπεύθυνος,<br>από την αρχή<br>ως το τέλος.', how_p: 'Σας δείχνουμε τα ακίνητα από κοντά ή με ζωντανή βιντεοκλήση και συντονίζουμε δικηγόρο, μηχανικό και συμβολαιογράφο ως την υπογραφή. Όλα γίνονται και από το εξωτερικό.', wa: 'WhatsApp', call: 'Κλήση' },
  en: { h1: 'Greek property,<br>personally<br>handled.', sub: 'Sales, rentals, villas and property management in Athens and the islands. In 10 languages.', buy: 'Buy', rent: 'Rent', villas: 'Villas', private: 'Off-market', q_l: 'What are you looking for?', q_h: 'Choose<br>where to begin.', buy_s: 'Apartments · Maisonettes · Villas', rent_s: 'Long-term', gv_d: 'Properties that qualify for a residence permit.', gv_c: 'Guide', own: 'Own a<br>property?', own_d: 'Sale, rental, or management and Airbnb.', own_c: 'List it', yacht_s: 'Yachts for sale', off_h: 'Off<br>market.', off_p: 'Many of our properties are never published. We present them privately, to those who ask for access.', off_c: 'Request access', col_l: 'Available now', col_h: 'The collection', all: 'All', sale: 'For sale', rentm: 'For rent', ask: 'Price on request', month: '/month', s1: 'Available now', s2: 'Rented', s3: 'Sold', how_l: 'How we work', how_h: 'One person,<br>from start<br>to finish.', how_p: 'We show you properties in person or by live video call, and coordinate your lawyer, engineer and notary through to signing. Everything can be done from abroad.', wa: 'WhatsApp', call: 'Call' },
  he: { h1: 'נדל״ן ביוון,<br>בליווי<br>אישי.', sub: 'מכירה, השכרה, וילות וניהול נכסים באתונה ובאיים. ב־10 שפות.', buy: 'קנייה', rent: 'השכרה', villas: 'וילות', private: 'Off-market', q_l: 'מה אתם מחפשים?', q_h: 'בחרו<br>מאיפה להתחיל.', buy_s: 'דירות · מזונטים · וילות', rent_s: 'לטווח ארוך', gv_d: 'נכסים שעומדים בתנאי היתר השהייה.', gv_c: 'מדריך', own: 'יש לכם<br>נכס?', own_d: 'מכירה, השכרה או ניהול ו־Airbnb.', own_c: 'מסרו לנו', yacht_s: 'יאכטות למכירה', off_h: 'מחוץ<br>לשוק.', off_p: 'רבים מהנכסים שלנו לא מתפרסמים. אנחנו מציגים אותם באופן פרטי, למי שמבקש גישה.', off_c: 'בקשו גישה', col_l: 'זמינים עכשיו', col_h: 'הקולקציה', all: 'הכול', sale: 'למכירה', rentm: 'להשכרה', ask: 'מחיר לפי בקשה', month: '/חודש', s1: 'זמינים עכשיו', s2: 'הושכרו', s3: 'נמכרו', how_l: 'איך אנחנו עובדים', how_h: 'איש קשר אחד,<br>מההתחלה<br>ועד הסוף.', how_p: 'אנחנו מציגים לכם נכסים פנים אל פנים או בשיחת וידאו חיה, ומתאמים עורך דין, מהנדס ונוטריון עד החתימה. הכול אפשרי גם מחו״ל.', wa: 'WhatsApp', call: 'התקשרו' },
  tr: { h1: 'Gayrimenkul,<br>kişisel<br>özenle.', sub: 'Atina’da ve adalarda satış, kiralama, villalar ve mülk yönetimi. 10 dilde.', buy: 'Satın al', rent: 'Kirala', villas: 'Villalar', private: 'Off-market', q_l: 'Ne arıyorsunuz?', q_h: 'Nereden<br>başlayacağınızı seçin.', buy_s: 'Daireler · Dubleksler · Villalar', rent_s: 'Uzun dönem', gv_d: 'Oturum izni şartlarını karşılayan mülkler.', gv_c: 'Rehber', own: 'Mülkünüz<br>mü var?', own_d: 'Satış, kiralama ya da yönetim ve Airbnb.', own_c: 'Bize bırakın', yacht_s: 'Satılık yatlar', off_h: 'Piyasa<br>dışı.', off_p: 'Mülklerimizin çoğu hiç yayınlanmaz. Erişim isteyenlere özel olarak sunuyoruz.', off_c: 'Erişim isteyin', col_l: 'Şu an mevcut', col_h: 'Koleksiyon', all: 'Tümü', sale: 'Satılık', rentm: 'Kiralık', ask: 'Fiyat için sorun', month: '/ay', s1: 'Şu an mevcut', s2: 'Kiralandı', s3: 'Satıldı', how_l: 'Nasıl çalışıyoruz', how_h: 'Tek bir sorumlu,<br>baştan<br>sona.', how_p: 'Mülkleri yerinde veya canlı görüntülü görüşmeyle gösteriyor; avukat, mühendis ve noteri imzaya kadar koordine ediyoruz. Her şey yurt dışından da yapılabilir.', wa: 'WhatsApp', call: 'Ara' },
  ar: { h1: 'عقارات<br>برعاية<br>شخصية.', sub: 'بيع وتأجير وفلل وإدارة عقارات في أثينا والجزر اليونانية. بعشر لغات.', buy: 'شراء', rent: 'إيجار', villas: 'فلل', private: 'خارج السوق', q_l: 'عمّ تبحثون؟', q_h: 'اختاروا<br>من أين تبدأون.', buy_s: 'شقق · دوبلكس · فلل', rent_s: 'طويل الأمد', gv_d: 'عقارات تستوفي شروط تصريح الإقامة.', gv_c: 'الدليل', own: 'هل تملكون<br>عقارًا؟', own_d: 'بيع أو تأجير أو إدارة وAirbnb.', own_c: 'اعهدوا به إلينا', yacht_s: 'يخوت للبيع', off_h: 'خارج<br>السوق.', off_p: 'كثير من عقاراتنا لا يُنشر أبدًا. نعرضها بشكل خاص لمن يطلب الوصول.', off_c: 'اطلبوا الوصول', col_l: 'متاح الآن', col_h: 'المجموعة', all: 'الكل', sale: 'للبيع', rentm: 'للإيجار', ask: 'السعر عند الطلب', month: '/شهريًا', s1: 'متاح الآن', s2: 'تم تأجيرها', s3: 'تم بيعها', how_l: 'كيف نعمل', how_h: 'مسؤول واحد<br>من البداية<br>حتى النهاية.', how_p: 'نعرض عليكم العقارات شخصيًا أو عبر مكالمة فيديو مباشرة، وننسّق مع المحامي والمهندس وكاتب العدل حتى التوقيع. ويمكن إتمام كل شيء من الخارج.', wa: 'واتساب', call: 'اتصال' },
  zh: { h1: '希腊房产，<br>专人<br>打理。', sub: '雅典及希腊海岛的房产买卖、租赁、别墅与物业管理，提供10种语言服务。', buy: '购房', rent: '租房', villas: '别墅', private: '非公开', q_l: '您在寻找什么？', q_h: '从这里<br>开始。', buy_s: '公寓 · 复式 · 别墅', rent_s: '长租', gv_d: '符合居留许可条件的房产。', gv_c: '指南', own: '您有<br>房产吗？', own_d: '出售、出租，或物业管理与Airbnb。', own_c: '委托我们', yacht_s: '游艇出售', off_h: '非公开<br>房源。', off_p: '我们的许多房产从不公开发布，仅向申请访问的客户私下展示。', off_c: '申请访问', col_l: '现有房源', col_h: '精选', all: '全部', sale: '出售', rentm: '出租', ask: '价格请咨询', month: '/月', s1: '现有房源', s2: '已出租', s3: '已售出', how_l: '我们的服务方式', how_h: '一位专人，<br>全程<br>负责。', how_p: '我们可带您实地看房或通过视频直播看房，并协调律师、工程师和公证人直至签约。所有流程均可在海外完成。', wa: 'WhatsApp', call: '致电' },
  ru: { h1: 'Недвижимость<br>с личной<br>заботой.', sub: 'Продажа, аренда, виллы и управление недвижимостью в Афинах и на островах. На 10 языках.', buy: 'Купить', rent: 'Аренда', villas: 'Виллы', private: 'Off-market', q_l: 'Что вы ищете?', q_h: 'Выберите,<br>с чего начать.', buy_s: 'Квартиры · Мезонеты · Виллы', rent_s: 'Долгосрочно', gv_d: 'Объекты, подходящие для вида на жительство.', gv_c: 'Гид', own: 'Есть<br>недвижимость?', own_d: 'Продажа, аренда или управление и Airbnb.', own_c: 'Доверить нам', yacht_s: 'Яхты на продажу', off_h: 'Вне<br>рынка.', off_p: 'Многие наши объекты никогда не публикуются. Мы показываем их лично тем, кто запросит доступ.', off_c: 'Запросить доступ', col_l: 'Доступно сейчас', col_h: 'Коллекция', all: 'Все', sale: 'Продажа', rentm: 'Аренда', ask: 'Цена по запросу', month: '/мес.', s1: 'Доступно сейчас', s2: 'Сдано', s3: 'Продано', how_l: 'Как мы работаем', how_h: 'Один<br>ответственный —<br>от начала до конца.', how_p: 'Показываем объекты лично или по видеосвязи и координируем юриста, инженера и нотариуса до подписания. Всё можно сделать из-за границы.', wa: 'WhatsApp', call: 'Позвонить' },
  fr: { h1: 'L’immobilier,<br>avec un soin<br>personnel.', sub: 'Vente, location, villas et gestion immobilière à Athènes et dans les îles. En 10 langues.', buy: 'Acheter', rent: 'Louer', villas: 'Villas', private: 'Off-market', q_l: 'Que recherchez-vous ?', q_h: 'Choisissez<br>par où commencer.', buy_s: 'Appartements · Duplex · Villas', rent_s: 'Longue durée', gv_d: 'Des biens éligibles au permis de séjour.', gv_c: 'Guide', own: 'Vous avez<br>un bien ?', own_d: 'Vente, location, ou gestion et Airbnb.', own_c: 'Nous confier', yacht_s: 'Yachts à vendre', off_h: 'Hors<br>marché.', off_p: 'Beaucoup de nos biens ne sont jamais publiés. Nous les présentons en privé à ceux qui demandent un accès.', off_c: 'Demander l’accès', col_l: 'Disponibles', col_h: 'La collection', all: 'Tout', sale: 'À vendre', rentm: 'À louer', ask: 'Prix sur demande', month: '/mois', s1: 'Disponibles', s2: 'Loués', s3: 'Vendus', how_l: 'Notre méthode', how_h: 'Un seul<br>interlocuteur,<br>du début à la fin.', how_p: 'Nous vous montrons les biens sur place ou en visio, et coordonnons avocat, ingénieur et notaire jusqu’à la signature. Tout peut se faire depuis l’étranger.', wa: 'WhatsApp', call: 'Appeler' },
  de: { h1: 'Immobilien,<br>persönlich<br>betreut.', sub: 'Verkauf, Vermietung, Villen und Hausverwaltung in Athen und auf den Inseln. In 10 Sprachen.', buy: 'Kaufen', rent: 'Mieten', villas: 'Villen', private: 'Off-Market', q_l: 'Was suchen Sie?', q_h: 'Wählen Sie<br>Ihren Einstieg.', buy_s: 'Wohnungen · Maisonetten · Villen', rent_s: 'Langfristig', gv_d: 'Immobilien, die die Kriterien für eine Aufenthaltserlaubnis erfüllen.', gv_c: 'Ratgeber', own: 'Eigene<br>Immobilie?', own_d: 'Verkauf, Vermietung oder Verwaltung und Airbnb.', own_c: 'Anvertrauen', yacht_s: 'Yachten zum Verkauf', off_h: 'Off<br>Market.', off_p: 'Viele unserer Immobilien werden nie veröffentlicht. Wir präsentieren sie privat – allen, die Zugang anfragen.', off_c: 'Zugang anfragen', col_l: 'Jetzt verfügbar', col_h: 'Die Kollektion', all: 'Alle', sale: 'Zum Kauf', rentm: 'Zur Miete', ask: 'Preis auf Anfrage', month: '/Monat', s1: 'Jetzt verfügbar', s2: 'Vermietet', s3: 'Verkauft', how_l: 'So arbeiten wir', how_h: 'Ein Ansprech-<br>partner, von Anfang<br>bis Ende.', how_p: 'Wir zeigen Ihnen Immobilien vor Ort oder per Live-Video und koordinieren Anwalt, Ingenieur und Notar bis zur Unterschrift. Alles ist auch aus dem Ausland möglich.', wa: 'WhatsApp', call: 'Anrufen' },
  it: { h1: 'Immobili,<br>con cura<br>personale.', sub: 'Vendita, affitto, ville e gestione immobiliare ad Atene e nelle isole. In 10 lingue.', buy: 'Comprare', rent: 'Affittare', villas: 'Ville', private: 'Off-market', q_l: 'Cosa cercate?', q_h: 'Scegliete<br>da dove iniziare.', buy_s: 'Appartamenti · Duplex · Ville', rent_s: 'Lungo termine', gv_d: 'Immobili che soddisfano i requisiti per il permesso di soggiorno.', gv_c: 'Guida', own: 'Avete<br>un immobile?', own_d: 'Vendita, affitto o gestione e Airbnb.', own_c: 'Affidatecelo', yacht_s: 'Yacht in vendita', off_h: 'Fuori<br>mercato.', off_p: 'Molti dei nostri immobili non vengono mai pubblicati. Li presentiamo in privato a chi richiede l’accesso.', off_c: 'Richiedi accesso', col_l: 'Disponibili ora', col_h: 'La collezione', all: 'Tutti', sale: 'In vendita', rentm: 'In affitto', ask: 'Prezzo su richiesta', month: '/mese', s1: 'Disponibili ora', s2: 'Affittati', s3: 'Venduti', how_l: 'Come lavoriamo', how_h: 'Un solo referente,<br>dall’inizio<br>alla fine.', how_p: 'Vi mostriamo gli immobili di persona o in videochiamata e coordiniamo avvocato, ingegnere e notaio fino alla firma. Tutto si può fare anche dall’estero.', wa: 'WhatsApp', call: 'Chiama' }
};
function sfmLinks(L) {
  if (L === 'el') return { buy: '/poliseis/', rent: '/enoikiaseis/', villas: '/villes/', gv: '/odigoi/golden-visa-agora-akinitou-ellada/', yachts: '/skafi/', private: '/villes/#enquiry', own: '/anathesi-akinitou/', all: '/akinita/' };
  if (L === 'en') return { buy: '/en/for-sale/', rent: '/en/rentals/', villas: '/en/villas/', gv: '/en/guides/greek-golden-visa-buying-property/', yachts: '/yachting/', private: '/en/villas/#enquiry', own: '/en/list-your-property/', all: '/en/properties/' };
  const p = '/' + L + '/';
  return { buy: p + 'properties/', rent: p + 'properties/', villas: p + 'villas/', gv: p + 'golden-visa/', yachts: '/yachting/', private: p + 'private/', own: p + 'private/#request', all: p + 'properties/' };
}
const sfmEsc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sfmTxt = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
function sfmCards(html, L, T, fromEn) {
  const out = [];
  for (const m of String(html).matchAll(/<a class="card[^"]*"([^>]*)>([\s\S]*?)<\/a>/g)) {
    const at = m[1], body = m[2];
    const g = (re, s) => ((s || at).match(re) || [])[1] || '';
    let href = g(/href="([^"]+)"/);
    if (!href) continue;
    const mode = g(/data-mode="([^"]+)"/), price = g(/data-price="([^"]+)"/), sqm = g(/data-sqm="([^"]+)"/);
    const img = g(/<img[^>]*src="([^"]+)"/, body);
    const area = sfmTxt(g(/<p class="area">([\s\S]*?)<\/p>/, body));
    const ptxt = sfmTxt(g(/<p class="c-price[^"]*">([\s\S]*?)<\/p>/, body));
    let title = sfmTxt(g(/<h3[^>]*>([\s\S]*?)<\/h3>/, body)), pr = ptxt;
    if (fromEn) {
      href = href.replace(/^\/en\/properties\//, '/' + L + '/properties/');
      title = (sqm ? '<bdi>' + sqm + ' m²</bdi>' : '') + (area ? (sqm ? ' · ' : '') + '<bdi>' + sfmEsc(area.split(' - ')[0]) + '</bdi>' : '');
      pr = /\d/.test(ptxt) && +price ? '<bdi>' + (+price).toLocaleString('de-DE') + ' €</bdi>' + (mode === 'rent' ? ' ' + T.month : '') : T.ask;
      out.push({ href, img, area, title, pr, mode: mode === 'rent' ? T.rentm : T.sale, raw: 1 }); if (out.length >= 8) break; continue;
    } else if (!/\d/.test(ptxt)) pr = T.ask;
    out.push({ href, img, area, title, pr, mode: mode === 'rent' ? T.rentm : T.sale });
    if (out.length >= 8) break;
  }
  return out;
}
async function sfMob(path, html, ori, hv) {
  try {
    const mm = path.match(/^\/(?:(en|tr|he|ar|zh|ru|fr|de|it)\/)?$/);
    if (!mm || html.indexOf('sfm-root') > -1) return html;
    const L = mm[1] || 'el', T = SFM_T[L], HV = SFM_HV[/^[0-3]$/.test(String(hv)) ? +hv : SFM_HERO], HT = SFM_HT[L], h1 = HV.t ? HT[HV.t] : T.h1, K = sfmLinks(L), rtl = L === 'he' || L === 'ar', ar = rtl ? '←' : '→';
    let cards = [], src = html;
    if (L === 'el' || L === 'en') cards = sfmCards(html, L, T, false);
    if (!cards.length) {
      try {
        let lt = await (await fetch(ori + '/en/properties/', { cf: { cacheTtl: 300 } })).text();
        if (typeof sfPatchHtml === 'function') lt = sfPatchHtml('/en/properties/', lt);
        if (typeof sfPriceHide === 'function') lt = sfPriceHide(lt);
        cards = sfmCards(lt, L, T, true);
      } catch (e) {}
    }
    let nums = [...src.matchAll(/data-count="(\d+)"/g)].map((x) => x[1]);
    if (nums.length < 3) { try { nums = [...(await (await fetch(ori + '/', { cf: { cacheTtl: 300 } })).text()).matchAll(/data-count="(\d+)"/g)].map((x) => x[1]); } catch (e) {} }
    const wa = ((html.match(/<a[^>]*class="fab-wa"[^>]*>/) || [''])[0].match(/href="([^"]+)"/) || [])[1] || 'https://wa.me/306906723676';
    const circ = [['buy', T.buy], ['rent', T.rent], ['villas', T.villas], ['gv', 'Golden Visa'], ['yachts', 'Yachts'], ['private', T.private]]
      .map(([k, n]) => `<a class="sfm-c" href="${K[k]}"><span><span>${n}</span></span></a>`).join('');
    const card = cards.map((c) => `<a class="sfm-card" href="${sfmEsc(c.href)}"><span class="sfm-ci">${c.img ? `<img src="${sfmEsc(c.img)}" alt="${sfmEsc(sfmTxt(c.title))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span><span class="sfm-lb">${sfmEsc(c.area)}${c.area ? ' · ' : ''}${sfmEsc(c.mode)}</span><span class="sfm-ct">${c.raw ? c.title : sfmEsc(c.title)}</span><span class="sfm-cp">${c.raw ? c.pr : sfmEsc(c.pr)}</span></a>`).join('');
    const stats = nums.length >= 3 ? `<section class="sfm-stats"><div><b>${nums[0]}</b><span>${T.s1}</span></div><div><b>${nums[1]}</b><span>${T.s2}</span></div><div><b>${nums[2]}</b><span>${T.s3}</span></div></section>` : '';
    const img = (k, w, h) => `<img src="${SFM_U(SFM_P[k], w, h)}" srcset="${SFM_U(SFM_P[k], w, h)} 1x, ${SFM_U(SFM_P[k], w * 2, h ? h * 2 : 0)} 2x" alt="" loading="lazy" decoding="async">`;
    const block = `<div class="sfm" id="sfm-root" data-lang="${L}" data-theme="${SFM_THEME}">
<section class="sfm-hero sfm-l-${HV.lay}"><video class="sfm-v" muted loop playsinline preload="none" poster="${SFM_MEDIA}${HV.v}.jpg" data-src="${SFM_MEDIA}${HV.v}.mp4" aria-hidden="true"></video><div class="sfm-sh"></div>
<div class="sfm-hc"><span class="sfm-k">ATHENS · RIVIERA · ISLANDS</span><h1 class="sfm-d">${h1}</h1><p>${T.sub}</p><div class="sfm-hb"><a class="sfm-pill sfm-pw" href="${K.all}">${HT[4]}</a><a class="sfm-pill" href="${K.own}">${T.own.replace(/<br>/g, ' ')}</a></div><a class="sfm-k sfm-down" href="#sfm-paths">${T.q_l} ↓</a></div></section>
<nav class="sfm-circ" aria-label="${sfmEsc(T.q_l)}">${circ}</nav>
<section class="sfm-q" id="sfm-paths"><span class="sfm-k sfm-m">${T.q_l}</span><h2 class="sfm-d">${T.q_h}</h2></section>
<section class="sfm-grid">
<a class="sfm-t sfm-w" href="${K.buy}">${img('buy', 780, 600)}<span class="sfm-tx"><span class="sfm-d sfm-tb">${T.buy}</span><span class="sfm-k">${T.buy_s} ${ar}</span></span></a>
<a class="sfm-t" href="${K.rent}">${img('rent', 390, 480)}<span class="sfm-tx"><span class="sfm-d">${T.rent}</span><span class="sfm-k">${T.rent_s} ${ar}</span></span></a>
<a class="sfm-t sfm-blk" href="${K.gv}"><span class="sfm-bt"><span class="sfm-d">Golden<br>Visa</span><span class="sfm-bd">${T.gv_d}</span><span class="sfm-hl"></span></span><span class="sfm-k sfm-m">${T.gv_c} ${ar}</span></a>
<a class="sfm-t sfm-blk" href="${K.own}"><span class="sfm-bt"><span class="sfm-d">${T.own}</span><span class="sfm-bd">${T.own_d}</span><span class="sfm-hl"></span></span><span class="sfm-k sfm-m">${T.own_c} ${ar}</span></a>
<a class="sfm-t" href="${K.yachts}"><video class="sfm-v" muted loop playsinline preload="none" poster="${SFM_MEDIA}sfm-yacht2.jpg" data-src="${SFM_MEDIA}sfm-yacht2.mp4" aria-hidden="true"></video><span class="sfm-tx"><span class="sfm-d">Yachting</span><span class="sfm-k">${T.yacht_s} ${ar}</span></span></a>
</section>
<section class="sfm-off">${img('off', 390, 560)}<div class="sfm-sh"></div><div class="sfm-oc"><span class="sfm-k">S.F. PROPERTIES</span><h2 class="sfm-d">${T.off_h}</h2><p>${T.off_p}</p><a class="sfm-btn" href="${K.private}">${T.off_c}</a></div></section>
${card ? `<section class="sfm-col"><div class="sfm-ch"><div><span class="sfm-k sfm-m">${T.col_l}</span><h2 class="sfm-d">${T.col_h}</h2></div><a class="sfm-k" href="${K.all}">${T.all} ${ar}</a></div><div class="sfm-rail">${card}</div></section>` : ''}
${stats}
<section class="sfm-how">${img('how', 390, 300)}<span class="sfm-k sfm-m">${T.how_l}</span><h2 class="sfm-d">${T.how_h}</h2><p>${T.how_p}</p><div class="sfm-langs"><a href="/">Ελληνικά</a><a href="/en/">English</a><a href="/he/">עברית</a><a href="/tr/">Türkçe</a><a href="/ar/">العربية</a><a href="/zh/">中文</a><a href="/ru/">Русский</a><a href="/fr/">Français</a><a href="/de/">Deutsch</a><a href="/it/">Italiano</a></div></section>
<div class="sfm-bar"><a class="sfm-wa" href="${sfmEsc(wa)}" target="_blank" rel="noopener">${T.wa}</a><a class="sfm-call" href="tel:+306906723676">${T.call}</a></div>
</div>`;
    const css = `<link rel="stylesheet" media="(max-width:760px)" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wdth,wght@62.5..100,200..400&family=Frank+Ruhl+Libre:wght@300;400&family=Noto+Naskh+Arabic:wght@400&display=swap"><style id="sfm-css">
.sfm{display:none}
@media (max-width:760px){
.sfm{--bg:#F5F1EA;--ink:#111110;--sub:#4A463F;--mut:#6F695E;--line:rgba(17,17,16,.13);--tile:#111110;--tink:#FFFFFF;--tsub:#CFCAC0;--tmut:#A9A397;--ring:rgba(17,17,16,.32);--dot:#111110;--dotink:#FFFFFF;--hdr:rgba(245,241,234,.9);--hdrink:#111110;--logo:dk;--wa:#111110;--waink:#FFFFFF;--foot:#111110}
.sfm[data-theme=noir]{--bg:#0B0B0C;--ink:#FFFFFF;--sub:#CFCAC0;--mut:#A9A397;--line:rgba(255,255,255,.14);--tile:#000000;--ring:rgba(255,255,255,.42);--dot:#000000;--hdr:rgba(11,11,12,.86);--hdrink:#FFFFFF;--wa:#FFFFFF;--waink:#0B0B0C;--foot:#0B0B0C}
.sfm[data-theme=sand]{--bg:#E7DFD2;--ink:#1B1915;--sub:#4B453B;--mut:#6A6254;--line:rgba(27,25,21,.14);--tile:#2A2520;--ring:rgba(27,25,21,.32);--dot:#2A2520;--hdr:rgba(231,223,210,.9);--hdrink:#1B1915;--wa:#1B1915;--foot:#2A2520}
.sfm[data-theme=white]{--bg:#FFFFFF;--ink:#0B0B0C;--sub:#4A4A4A;--mut:#6B6B6B;--line:rgba(0,0,0,.1);--tile:#0B0B0C;--ring:rgba(0,0,0,.28);--dot:#0B0B0C;--hdr:rgba(255,255,255,.92);--hdrink:#0B0B0C;--wa:#0B0B0C;--foot:#0B0B0C}
.sfm[data-theme=navy]{--bg:#0E2238;--ink:#FFFFFF;--sub:#C8CFD9;--mut:#9FB0C4;--line:rgba(255,255,255,.14);--tile:#0A1A2C;--ring:rgba(255,255,255,.4);--dot:#0A1A2C;--hdr:rgba(14,34,56,.88);--hdrink:#FFFFFF;--wa:#C9A56A;--waink:#0E2238;--foot:#0A1A2C}
html.sfm-pg,html.sfm-pg body{background:var(--sfm-bg,#F5F1EA)}
main>*:not(.sfm){display:none!important}
.fab-wa{display:none!important}
.sfm{display:block;background:var(--bg);color:var(--ink);font-family:Commissioner,system-ui,sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;padding-bottom:84px}
.sfm a{color:var(--ink);text-decoration:none}
.sfm *{box-sizing:border-box}
.sfm-d{font-family:'Noto Serif Display','Frank Ruhl Libre','Noto Naskh Arabic',Georgia,serif;font-stretch:68%;font-weight:300;text-transform:uppercase;letter-spacing:-.005em;line-height:.98;margin:0;color:var(--ink)}
.sfm[data-lang=he] .sfm-d,.sfm[data-lang=ar] .sfm-d,.sfm[data-lang=zh] .sfm-d{line-height:1.12}
.sfm-k{font-family:Commissioner,system-ui,sans-serif;font-size:10px;letter-spacing:.3em;text-transform:uppercase;font-weight:400;color:var(--ink)}
.sfm[data-lang=he] .sfm-k,.sfm[data-lang=ar] .sfm-k,.sfm[data-lang=zh] .sfm-k{letter-spacing:.06em;font-size:11.5px}
.sfm-m{color:var(--mut)}
.sfm-hero .sfm-d,.sfm-hero .sfm-k,.sfm-hero a,.sfm-tx .sfm-d,.sfm-tx .sfm-k,.sfm-off .sfm-d,.sfm-off .sfm-k,.sfm-off a{color:#fff}
.sfm-blk .sfm-d{color:var(--tink)}.sfm-blk .sfm-k{color:var(--tmut)}
.sfm-v,.sfm-hero>img,.sfm-t>img,.sfm-off>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#151517}
.sfm-sh{position:absolute;inset:0;background:rgba(8,8,9,.42)}
.sfm-hero{position:relative;height:100svh;min-height:560px;max-height:860px;overflow:hidden;margin-top:calc(-1 * var(--sfm-top,64px));background:#151517}
.sfm-hc{position:absolute;left:22px;right:22px;bottom:calc(36px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:16px}
.sfm-hc h1{font-size:clamp(44px,13.6vw,58px)}
.sfm-hc p{margin:0;font-size:15px;line-height:1.55;color:#ECE7DD;max-width:34ch}
.sfm-rule{width:44px;height:1px;background:rgba(255,255,255,.6)}
.sfm-hb{display:flex;gap:8px;flex-wrap:wrap}
.sfm .sfm-pill{height:44px;padding:0 20px;border-radius:22px;border:1px solid rgba(255,255,255,.7);display:inline-flex;align-items:center;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#fff;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);background:rgba(255,255,255,.06)}
.sfm .sfm-pill.sfm-pw{background:#fff;color:#111110;border-color:#fff;font-weight:500}
.sfm-l-center .sfm-hc{top:0;bottom:0;justify-content:center;align-items:center;text-align:center}
.sfm-l-center .sfm-hc p{max-width:30ch}
.sfm-l-center .sfm-hb{justify-content:center}
.sfm-l-center .sfm-down{position:absolute;bottom:calc(28px + env(safe-area-inset-bottom,0px))}
.sfm-l-center .sfm-sh{background:rgba(8,8,9,.38)}
.sfm-l-top .sfm-hc{top:calc(var(--sfm-top,64px) + 28px);bottom:calc(30px + env(safe-area-inset-bottom,0px))}
.sfm-l-top .sfm-hc h1{font-size:clamp(50px,15.5vw,64px)}
.sfm-l-top .sfm-hc p{margin-top:auto}
.sfm-l-top .sfm-sh{background:rgba(8,8,9,.34)}
.sfm-hc .sfm-rule{display:none}
.sfm-l-center .sfm-hc .sfm-down{left:0;right:0}
.sfm-circ{display:flex;gap:14px;overflow-x:auto;padding:26px 18px 22px;border-bottom:1px solid var(--line);scrollbar-width:none}
.sfm-circ::-webkit-scrollbar{display:none}
.sfm-c{flex:none;width:72px;height:72px;border-radius:50%;border:1px solid var(--ring);padding:3px}
.sfm-c>span{width:100%;height:100%;border-radius:50%;background:var(--dot);display:flex;align-items:center;justify-content:center;text-align:center;padding:6px}
.sfm-c>span>span{font-family:'Noto Serif Display','Frank Ruhl Libre','Noto Naskh Arabic',Georgia,serif;font-stretch:72%;font-size:11px;line-height:1.1;letter-spacing:.04em;text-transform:uppercase;color:var(--dotink)}
.sfm-q{padding:42px 22px 22px;display:flex;flex-direction:column;gap:10px}
.sfm-q h2{font-size:clamp(34px,10.4vw,44px)}
.sfm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;background:var(--bg)}
.sfm-t{position:relative;height:240px;overflow:hidden;display:block}
.sfm-t.sfm-w{grid-column:span 2;height:300px}
.sfm-t>img,.sfm-t>video{transition:transform 1.2s ease}
.sfm-t:active>img{transform:scale(1.03)}
.sfm-t:not(.sfm-blk)::after{content:"";position:absolute;inset:0;background:rgba(8,8,9,.3)}
.sfm-tx{position:absolute;left:14px;right:14px;bottom:16px;z-index:1;display:flex;flex-direction:column;gap:6px}
.sfm-tx .sfm-d{font-size:28px}
.sfm-tx .sfm-tb{font-size:46px}
.sfm-tx .sfm-k{font-size:9.5px;letter-spacing:.24em}
.sfm-blk{background:var(--tile);padding:18px 14px;display:flex;flex-direction:column;justify-content:space-between}
.sfm-bt{display:flex;flex-direction:column;gap:10px}
.sfm-bt .sfm-d{font-size:30px}
.sfm-bd{font-size:12px;line-height:1.45;color:var(--tsub)}
.sfm-hl{height:1px;background:rgba(255,255,255,.22)}
.sfm-blk .sfm-k{font-size:9.5px}
.sfm-off{position:relative;height:540px;overflow:hidden;margin-top:2px}
.sfm-off .sfm-sh{background:rgba(8,8,9,.52)}
.sfm-oc{position:absolute;inset:48px 22px 44px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}
.sfm-oc h2{font-size:48px}
.sfm-oc p{margin:0;font-size:14px;line-height:1.6;color:#ECE7DD;max-width:32ch}
.sfm-btn{margin-top:auto;height:46px;padding:0 26px;border:1px solid rgba(255,255,255,.75);border-radius:23px;display:inline-flex;align-items:center;font-size:11px;letter-spacing:.26em;text-transform:uppercase}
.sfm-col{padding:52px 0 0}
.sfm-ch{padding:0 22px 18px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
.sfm-ch>div{display:flex;flex-direction:column;gap:8px}
.sfm-ch h2{font-size:36px}
.sfm-rail{display:flex;gap:10px;overflow-x:auto;padding:0 22px 4px;scroll-snap-type:x mandatory;scroll-padding:0 22px;scrollbar-width:none}
.sfm-rail::-webkit-scrollbar{display:none}
.sfm-card{flex:none;width:72vw;max-width:290px;scroll-snap-align:start;display:flex;flex-direction:column;gap:10px}
.sfm-ci{position:relative;aspect-ratio:3/4;overflow:hidden;background:var(--line);display:block}
.sfm-ci img{width:100%;height:100%;object-fit:cover;display:block}
.sfm-lb{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--mut)}
.sfm-ct{font-family:'Noto Serif Display','Frank Ruhl Libre','Noto Naskh Arabic',Georgia,serif;font-stretch:78%;font-weight:300;font-size:21px;line-height:1.18;color:var(--ink)}
.sfm-cp{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink)}
.sfm-stats{margin:56px 22px 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sfm-stats div{padding:24px 0;display:flex;flex-direction:column;gap:6px}
.sfm-stats b{font-family:'Noto Serif Display',Georgia,serif;font-stretch:66%;font-weight:200;font-size:54px;line-height:1;color:var(--ink)}
.sfm-stats span{font-size:9.5px;letter-spacing:.18em;line-height:1.5;text-transform:uppercase;color:var(--mut);padding-inline-end:6px}
.sfm-how{padding:56px 22px 0;display:flex;flex-direction:column;gap:14px}
.sfm-how>img{width:100%;height:220px;object-fit:cover;display:block;margin-bottom:12px}
.sfm-how h2{font-size:clamp(32px,9.8vw,40px)}
.sfm-how p{margin:0;font-size:14px;line-height:1.65;color:var(--sub)}
.sfm-langs{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:10px}
.sfm-langs a{font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.sfm-bar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:45;display:flex;gap:8px;transition:transform .4s ease,opacity .4s}
.sfm-bar a{flex:1;height:50px;border-radius:25px;display:flex;align-items:center;justify-content:center;font-size:11px;letter-spacing:.24em;text-transform:uppercase}
.sfm .sfm-wa{background:var(--wa);color:var(--waink);font-weight:600}
.sfm .sfm-call{background:color-mix(in srgb,var(--bg) 78%,transparent);color:var(--ink);border:1px solid var(--ring);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.sfm-bar.sfm-hide{transform:translateY(90px);opacity:0}
body:not(.menu-open) .top{position:fixed;top:0;left:0;right:0;background:transparent;border-bottom-color:transparent;color:#fff;-webkit-backdrop-filter:none;backdrop-filter:none;transition:background .35s,color .35s}
body:not(.menu-open) .top .menu-btn,body:not(.menu-open) .top .menu-btn span,body:not(.menu-open) .top summary,body:not(.menu-open) .top .lang a{color:inherit}
body:not(.menu-open) .top .btn.small{background:transparent;color:inherit;border-color:currentColor}
body:not(.menu-open) .top:not(.scrolled) .logo-img.dk{display:none}
body:not(.menu-open) .top:not(.scrolled) .logo-img.lt{display:block}
body:not(.menu-open) .top.scrolled{background:var(--sfm-hdr,rgba(245,241,234,.9));color:var(--sfm-hdrink,#111110);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom-color:rgba(127,127,127,.15)}
html.sfm-dark body:not(.menu-open) .top.scrolled .logo-img.dk{display:none}
html.sfm-dark body:not(.menu-open) .top.scrolled .logo-img.lt{display:block}
html:not(.sfm-dark) body:not(.menu-open) .top.scrolled .logo-img.dk{display:block}
html:not(.sfm-dark) body:not(.menu-open) .top.scrolled .logo-img.lt{display:none}
.sfm[data-lang=he],.sfm[data-lang=ar]{direction:rtl}
footer.site{background:var(--sfm-foot,#111110)!important;padding-bottom:96px!important}
}
@media (max-width:760px) and (prefers-reduced-motion:reduce){.sfm-t>img{transition:none}}
</style>`;
    const js = `<script>(function(){if(!window.matchMedia||!matchMedia('(max-width:760px)').matches)return;var r=document.getElementById('sfm-root');if(!r)return;try{var q=(location.search.match(/[?&]t=([a-z]+)/)||[])[1];if(q&&/workers\.dev$/.test(location.hostname))r.setAttribute('data-theme',q)}catch(e){}var cs=getComputedStyle(r),de=document.documentElement;['bg','hdr','hdrink','foot'].forEach(function(k){de.style.setProperty('--sfm-'+k,cs.getPropertyValue('--'+k))});de.classList.add('sfm-pg');if(/noir|navy/.test(r.getAttribute('data-theme')))de.classList.add('sfm-dark');var t=document.querySelector('.top');if(t)document.documentElement.style.setProperty('--sfm-top',t.offsetHeight+'px');var mo=matchMedia('(prefers-reduced-motion:reduce)').matches;var vs=r.querySelectorAll('video[data-src]');function go(v){if(!v.src)v.src=v.getAttribute('data-src');var p=v.play();if(p&&p.catch)p.catch(function(){})}if(!mo){if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)go(e.target);else if(e.target.src)e.target.pause()})},{rootMargin:'150px'});vs.forEach(function(v){io.observe(v)})}else vs.forEach(go)}var b=r.querySelector('.sfm-bar'),h=r.querySelector('.sfm-hero');function sc(){if(b&&h)b.classList.toggle('sfm-hide',window.scrollY<h.offsetHeight*0.55)}window.addEventListener('scroll',sc,{passive:true});sc()})();</script>`;
    let out = html.replace(/(<main[^>]*>)/, '$1' + block);
    if (out === html) return html;
    out = out.replace('</head>', css + '</head>').replace(/<\/body>(?![\s\S]*<\/body>)/, js + '</body>');
    return out;
  } catch (e) { return html; }
}
