// ===== Mobile home (≤760px): editorial black — S.F. Properties =====
const SFM_LANGS = ['el', 'en', 'tr', 'he', 'ar', 'zh', 'ru', 'fr', 'de', 'it'];
const SFM_U = (id, w, h) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&q=68&w=' + w + (h ? '&h=' + h : '');
const SFM_P = { buy: 'photo-1606917454663-343e58811bb1', rent: 'photo-1782113326479-b450da6c86d9', off: 'photo-1635752807994-212f7d1e678b', how: 'photo-1789737272550-f6c39aafa85b' };
const SFM_MEDIA = 'https://sfproperties.gr/_bp/';
const SFM_THEME = 'ivory';
const SFM_HERO = 3;
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
  try { html = await sfVillaYachts(path, sfRadar(path, html)); } catch (e) {}
  try { html = sfVillaFacts(path, html); } catch (e) {}
  try { html = sfVillaSkin(html); } catch (e) {}
  return sfMobHome(path, html, ori, hv);
}
async function sfMobHome(path, html, ori, hv) {
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
      .map(([k, n]) => `<a href="${K[k]}">${n}</a>`).join('<span aria-hidden="true"></span>');
    const card = cards.map((c) => `<a class="sfm-card" href="${sfmEsc(c.href)}"><span class="sfm-ci">${c.img ? `<img src="${sfmEsc(c.img)}" alt="${sfmEsc(sfmTxt(c.title))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span><span class="sfm-lb">${sfmEsc(c.area)}${c.area ? ' · ' : ''}${sfmEsc(c.mode)}</span><span class="sfm-ct">${c.raw ? c.title : sfmEsc(c.title)}</span><span class="sfm-cp">${c.raw ? c.pr : sfmEsc(c.pr)}</span></a>`).join('');
    const stats = nums.length >= 3 ? `<section class="sfm-stats"><div><b>${nums[0]}</b><span>${T.s1}</span></div><div><b>${nums[1]}</b><span>${T.s2}</span></div><div><b>${nums[2]}</b><span>${T.s3}</span></div></section>` : '';
    const img = (k, w, h) => `<img src="${SFM_U(SFM_P[k], w, h)}" srcset="${SFM_U(SFM_P[k], w, h)} 1x, ${SFM_U(SFM_P[k], w * 2, h ? h * 2 : 0)} 2x" alt="" loading="lazy" decoding="async">`;
    const block = `<div class="sfm" id="sfm-root" data-lang="${L}" data-theme="${SFM_THEME}">
<section class="sfm-hero sfm-l-${HV.lay}"><video class="sfm-v" muted loop playsinline preload="none" poster="${SFM_MEDIA}${HV.v}.jpg" data-src="${SFM_MEDIA}${HV.v}.mp4" aria-hidden="true"></video><div class="sfm-sh"></div>
<div class="sfm-hc"><span class="sfm-k">ATHENS · RIVIERA · ISLANDS</span><h1 class="sfm-d">${h1}</h1><p>${T.sub}</p><div class="sfm-hb"><a class="sfm-pill sfm-pw" href="${K.all}">${HT[4]}</a><a class="sfm-pill" href="${K.own}">${T.own.replace(/<br>/g, ' ')}</a></div><a class="sfm-k sfm-down" href="#sfm-paths">${T.q_l} ↓</a></div></section>
<nav class="sfm-idx" aria-label="${sfmEsc(T.q_l)}">${circ}</nav>
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
.sfm-hero{position:relative;height:100svh;min-height:560px;max-height:860px;overflow:hidden;background:#151517}
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
.sfm-l-top .sfm-v{filter:brightness(1.55) saturate(1.12) contrast(1.04)}
.sfm-l-top .sfm-sh{background:linear-gradient(180deg,rgba(8,8,9,.5) 0%,rgba(8,8,9,.18) 34%,rgba(8,8,9,0) 50%,rgba(8,8,9,.12) 62%,rgba(8,8,9,.62) 100%)}
.sfm-l-top .sfm-hc h1,.sfm-l-top .sfm-hc .sfm-k,.sfm-l-top .sfm-hc p{text-shadow:0 1px 22px rgba(0,0,0,.45),0 1px 3px rgba(0,0,0,.3)}
.sfm-hc .sfm-rule{display:none}
.sfm-l-center .sfm-hc .sfm-down{left:0;right:0}
.sfm-idx{display:flex;align-items:center;gap:16px;overflow-x:auto;padding:0 22px;height:58px;border-bottom:1px solid var(--line);scrollbar-width:none;white-space:nowrap}
.sfm-idx::-webkit-scrollbar{display:none}
.sfm-idx a{flex:none;font-size:10.5px;letter-spacing:.26em;text-transform:uppercase;font-weight:400}
.sfm-idx>span{flex:none;width:1px;height:14px;background:var(--line)}
.sfm[data-lang=he] .sfm-idx a,.sfm[data-lang=ar] .sfm-idx a,.sfm[data-lang=zh] .sfm-idx a{letter-spacing:.04em;font-size:12.5px}
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

// ===== Voula villa: live location radar (replaces the static map image) =====
const SFR_HOUSE = [37.84557, 23.75701];
const SFR_PTS = [
  { k: 'tram', ll: [37.84965, 23.75255], d: '600 m', dir: 'top' },
  { k: 'beach', ll: [37.84967, 23.75036], d: '700 m', dir: 'left' },
  { k: 'gly', ll: [37.8600, 23.7525], d: '1.6 km' },
  { k: 'marina', ll: [37.87084, 23.73332], d: '3.5 km' },
  { k: 'astir', ll: [37.80916, 23.77360], d: '4.4 km' },
  { k: 'lake', ll: [37.80773, 23.78571], d: '4.9 km', dir: 'right' }
];
const SFR_N = {
  el: { house: 'Το σπίτι', tram: 'Τραμ Ασκληπιείο', beach: 'Παραλία Βούλας', gly: 'Κέντρο Γλυφάδας', marina: 'Μαρίνα Γλυφάδας', astir: 'Astir Beach', lake: 'Λίμνη Βουλιαγμένης' },
  en: { house: 'The house', tram: 'Asklipieio tram', beach: 'Voula Beach', gly: 'Glyfada centre', marina: 'Glyfada Marina', astir: 'Astir Beach', lake: 'Lake Vouliagmeni' },
  he: { house: 'הבית', tram: 'רכבת קלה Asklipieio', beach: 'חוף וולה', gly: 'מרכז גליפדה', marina: 'מרינת גליפדה', astir: 'חוף אסטיר', lake: 'אגם ווליאגמני' },
  tr: { house: 'Ev' }, ar: { house: 'المنزل' }, zh: { house: '房屋' }, ru: { house: 'Дом' }, fr: { house: 'La maison' }, de: { house: 'Das Haus' }, it: { house: 'La casa' }
};
function sfRadar(path, html) {
  if (html.indexOf('/assets/img/voula/map.jpg') < 0 || html.indexOf('sfr-root') > -1) return html;
  const L = (path.match(/^\/(en|tr|he|ar|zh|ru|fr|de|it)\//) || [])[1] || 'el';
  const N = Object.assign({}, SFR_N.en, SFR_N[L] || {});
  const cfg = JSON.stringify({ h: SFR_HOUSE, n: N.house, p: SFR_PTS.map((x) => ({ ll: x.ll, n: N[x.k], d: x.d, dir: x.dir || 'left' })) }).replace(/</g, '\\u003c');
  let done = false;
  const out = html.replace(/<img[^>]*src="\/assets\/img\/voula\/map\.jpg"[^>]*>/, (m) => { done = true; return `<div class="sfr" id="sfr-root" data-cfg='${cfg.replace(/'/g, '&#39;')}'><div class="sfr-map" role="img" aria-label="${sfmEsc((m.match(/alt="([^"]*)"/) || [])[1] || 'Map')}"></div><noscript>${m}</noscript></div>`; });
  if (!done) return html;
  const css = `<style id="sfr-css">
.xv-loc-map:has(#sfr-root){height:100%;min-height:440px;max-height:760px;position:sticky;top:90px}
.sfr{position:relative;width:100%;height:100%;min-height:clamp(380px,62vh,620px);border-radius:inherit;overflow:hidden;background:#0b1a2b;isolation:isolate}
.sfr-map{position:absolute;inset:0;background:#0b1a2b}
.sfr .sfr-base{filter:sepia(.45) hue-rotate(175deg) saturate(2.2) brightness(1.18) contrast(1.05)}
.sfr .sfr-ref{opacity:.75}
.sfr .leaflet-container{background:#0b1a2b;font-family:Commissioner,system-ui,sans-serif}
.sfr .leaflet-control-attribution{background:rgba(11,26,43,.7);color:#8fa3b8;font-size:9px}
.sfr .leaflet-control-attribution a{color:#b8c7d6}
.sfr .leaflet-control-zoom a{background:rgba(11,26,43,.85);color:#e8dcc2;border-color:rgba(232,220,194,.2)}
.sfr-lb.leaflet-tooltip{background:rgba(11,26,43,.82);border:1px solid rgba(143,214,224,.35);color:#e9f3f5;border-radius:10px;padding:5px 9px;font-size:12px;line-height:1.25;box-shadow:0 6px 20px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.sfr-lb.leaflet-tooltip b{display:block;color:#8fd6e0;font-weight:500;font-size:11px;letter-spacing:.04em}
.sfr-lb.leaflet-tooltip::before{display:none}
.sfr-ring.leaflet-tooltip{background:none;border:0;box-shadow:none;color:#d9b76f;font-size:10px;letter-spacing:.18em;padding:0}
.sfr-ring.leaflet-tooltip::before{display:none}
.sfr-h{position:relative;width:0;height:0}
.sfr-h i{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:#d9b76f;box-shadow:0 0 0 5px rgba(217,183,111,.25),0 0 24px rgba(217,183,111,.9)}
.sfr-h s{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;border:2px solid rgba(217,183,111,.8);animation:sfrPing 2.6s cubic-bezier(.2,.6,.3,1) infinite}
.sfr-h s+s{animation-delay:1.3s}
.sfr-h u{position:absolute;left:-230px;top:-230px;width:460px;height:460px;border-radius:50%;background:conic-gradient(from 0deg,rgba(217,183,111,.32),rgba(217,183,111,.08) 40deg,rgba(217,183,111,0) 70deg,rgba(217,183,111,0));animation:sfrSweep 6s linear infinite;pointer-events:none;-webkit-mask:radial-gradient(circle,#000 0 69%,transparent 70%);mask:radial-gradient(circle,#000 0 69%,transparent 70%)}
.sfr-h em{position:absolute;left:16px;top:-12px;white-space:nowrap;font-style:normal;font-family:'Literata',Georgia,serif;font-size:17px;color:#f3e6c8;text-shadow:0 2px 12px rgba(0,0,0,.6)}
[dir=rtl] .sfr-h em{left:auto;right:16px}
@keyframes sfrPing{0%{transform:scale(1);opacity:.9}100%{transform:scale(7);opacity:0}}
@keyframes sfrSweep{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.sfr-h s,.sfr-h u{animation:none}}
.sfr.sfr-fail .sfr-map{display:none}
</style>`;
  const js = `<script>(function(){var r=document.getElementById('sfr-root');if(!r)return;var cfg;try{cfg=JSON.parse(r.getAttribute('data-cfg'))}catch(e){return}
function fail(){r.classList.add('sfr-fail');var n=r.querySelector('noscript');if(n){var d=document.createElement('div');d.innerHTML=n.textContent;r.appendChild(d.firstChild)}}
function css(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)}
function init(){var L=window.L;if(!L)return fail();var mob=matchMedia('(max-width:760px)').matches;
var m=L.map(r.querySelector('.sfr-map'),{zoomControl:!mob,scrollWheelZoom:false,dragging:!L.Browser.mobile,tap:false,attributionControl:true,zoomSnap:.25});
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:18,className:'sfr-base',attribution:'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'}).addTo(m);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:18,className:'sfr-ref'}).addTo(m);
var H=cfg.h;[1000,3000].forEach(function(rad){L.circle(H,{radius:rad,color:'#d9b76f',weight:1,opacity:.55,dashArray:'4 6',fill:rad===1000,fillColor:'#d9b76f',fillOpacity:.04,interactive:false}).addTo(m);var lat=H[0]+rad/111320;L.tooltip({permanent:true,direction:'center',className:'sfr-ring'}).setLatLng([lat,H[1]]).setContent(rad/1000+' km').addTo(m)});
var pts=[H];cfg.p.forEach(function(p,i){pts.push(p.ll);L.polyline([H,p.ll],{color:'#8fd6e0',weight:1,opacity:.28,dashArray:'2 6',interactive:false}).addTo(m);L.circleMarker(p.ll,{radius:5,color:'#0b1a2b',weight:2,fillColor:'#8fd6e0',fillOpacity:1}).addTo(m).bindTooltip('<b>'+p.d+'</b>'+p.n,{permanent:true,direction:p.dir,offset:p.dir==='top'?[0,-8]:p.dir==='left'?[-8,0]:[8,0],className:'sfr-lb'})});
L.marker(H,{interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:'<div class="sfr-h"><u></u><s></s><s></s><i></i><em>'+cfg.n+'</em></div>'}),zIndexOffset:1000}).addTo(m);
var fit=function(){m.invalidateSize();m.fitBounds(L.latLngBounds(pts),{padding:mob?[40,40]:[90,90]})};fit();setTimeout(fit,350);window.addEventListener('resize',function(){clearTimeout(r.__t);r.__t=setTimeout(fit,250)})}
function load(){if(r.__l)return;r.__l=1;css('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=init;s.onerror=fail;document.head.appendChild(s)}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();load()}},{rootMargin:'400px'});io.observe(r)}else load()})();</script>`;
  return out.replace('</head>', css + '</head>').replace(/<\/body>(?![\s\S]*<\/body>)/, js + '</body>');
}

// ===== Voula villa: yachts strip at the end of the page =====
const SFV_T = {
  el: ['Το καλοκαίρι<br>συνεχίζεται στη θάλασσα.', 'Επιλεγμένα σκάφη προς πώληση, με πλήρη στοιχεία και φωτογραφίες. Επισκέψεις και δοκιμαστικός πλους κατόπιν ραντεβού.', 'Όλα τα σκάφη', 'μ.'],
  en: ['The summer<br>continues at sea.', 'Selected yachts for sale, with full specifications and photos. Viewings and sea trials by appointment.', 'All yachts', 'm'],
  he: ['הקיץ<br>ממשיך בים.', 'יאכטות נבחרות למכירה, עם מפרט מלא ותמונות. צפייה ושיט ניסיון בתיאום מראש.', 'כל היאכטות', 'מ׳'],
  tr: ['Yaz<br>denizde devam ediyor.', 'Tam teknik özellikler ve fotoğraflarla seçkin satılık yatlar. Randevu ile ziyaret ve deneme seyri.', 'Tüm yatlar', 'm'],
  ar: ['الصيف<br>يستمر في البحر.', 'يخوت مختارة للبيع مع مواصفات كاملة وصور. المعاينة والإبحار التجريبي بموعد مسبق.', 'كل اليخوت', 'م'],
  zh: ['夏天，<br>在海上延续。', '精选出售游艇，附完整参数与照片。可预约看船及试航。', '全部游艇', '米'],
  ru: ['Лето<br>продолжается в море.', 'Избранные яхты на продажу — с полными характеристиками и фото. Осмотр и пробный выход в море по записи.', 'Все яхты', 'м'],
  fr: ['L’été<br>continue en mer.', 'Une sélection de yachts à vendre, avec fiches complètes et photos. Visites et essais en mer sur rendez-vous.', 'Tous les yachts', 'm'],
  de: ['Der Sommer<br>geht auf See weiter.', 'Ausgewählte Yachten zum Verkauf, mit allen Daten und Fotos. Besichtigungen und Probefahrten nach Vereinbarung.', 'Alle Yachten', 'm'],
  it: ['L’estate<br>continua in mare.', 'Yacht selezionati in vendita, con schede complete e foto. Visite e prove in mare su appuntamento.', 'Tutti gli yacht', 'm']
};
async function sfVillaYachts(path, html) {
  if (html.indexOf('sfr-root') < 0 || html.indexOf('sfv-root') > -1 || typeof sfyData !== 'function') return html;
  const L = (path.match(/^\/(en|tr|he|ar|zh|ru|fr|de|it)\//) || [])[1] || 'el', T = SFV_T[L];
  const d = await sfyData();
  const ys = (d.yachts || []).filter((y) => y.slug && y.slug !== 'ferretti-881-ansimar' && (y.img || y.images || []).length)
    .map((y) => ({ y, len: parseFloat(String((y.stats && y.stats.Length) || '').replace(',', '.')) || 0 }))
    .sort((a, b) => b.len - a.len).slice(0, 8);
  if (!ys.length) return html;
  const cards = ys.map(({ y, len }) => {
    const im = (y.img && y.img[0] && (y.img[0].m || y.img[0].s)) || (y.images || [])[0];
    const meta = [len ? len + ' ' + T[3] : '', y.year, y.location].filter(Boolean).map(sfmEsc).join(' · ');
    return `<a class="sfv-c" href="/yachting/${sfmEsc(y.slug)}/"><span class="sfv-i"><img src="${sfmEsc(im)}" alt="${sfmEsc(y.title)}" loading="lazy" decoding="async"></span><span class="sfv-m">${meta}</span><span class="sfv-n">${sfmEsc(y.name || y.title)}</span><span class="sfv-md">${sfmEsc(y.model || '')}</span></a>`;
  }).join('');
  const all = L === 'el' ? '/skafi/' : '/yachting/';
  const sec = `<section class="sfv" id="sfv-root"><div class="sfv-w"><div class="sfv-h"><div><span class="sfv-k">S.F. Yachting</span><h2>${T[0]}</h2><p>${T[1]}</p></div><a class="sfv-all" href="${all}">${T[2]} ${L === 'he' || L === 'ar' ? '←' : '→'}</a></div></div><div class="sfv-rail">${cards}</div></section>
<style>
.sfv{background:#0b1626;color:#f3ece0;padding:clamp(56px,8vw,110px) 0 clamp(56px,7vw,96px);border-top:1px solid rgba(243,236,224,.08)}
.sfv-w{max-width:1240px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}
.sfv-h{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:34px}
.sfv-k{font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#d9b76f}
.sfv h2{margin:14px 0 14px;font-family:'Literata',Georgia,serif;font-weight:400;font-size:clamp(34px,5vw,58px);line-height:1.04;color:#f3ece0}
.sfv p{margin:0;max-width:52ch;font-size:15px;line-height:1.65;color:#b9c2cf}
.sfv-all{flex:none;height:46px;padding:0 24px;border-radius:23px;border:1px solid rgba(217,183,111,.6);color:#f3ece0!important;text-decoration:none;display:inline-flex;align-items:center;font-size:12px;letter-spacing:.2em;text-transform:uppercase}
.sfv-all:hover{background:#d9b76f;color:#0b1626!important}
.sfv-rail{--pad:max(clamp(20px,4vw,40px),calc((100vw - 1240px)/2 + 40px));display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 var(--pad) 8px;scroll-padding-inline:var(--pad);scrollbar-width:thin;scrollbar-color:rgba(217,183,111,.4) transparent}
.sfv-c{flex:none;width:min(78vw,320px);scroll-snap-align:start;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:10px}
.sfv-i{display:block;aspect-ratio:4/5;overflow:hidden;border-radius:4px;background:#13233a}
.sfv-i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 1.1s ease}
.sfv-c:hover .sfv-i img{transform:scale(1.04)}
.sfv-m{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#d9b76f}
.sfv-n{font-family:'Literata',Georgia,serif;font-size:22px;line-height:1.15;color:#f3ece0}
.sfv-md{font-size:13px;color:#93a0b1}
</style>`;
  const i = html.search(/<footer[\s>]/);
  return i < 0 ? html : html.slice(0, i) + sec + html.slice(i);
}

// ===== Villa pages (.xv): editorial ivory skin, same aesthetic as the mobile home =====
const SFV_SKIN = true;
function sfVillaSkin(html) {
  if (!SFV_SKIN || html.indexOf('class="xv"') < 0 || html.indexOf('sfvs-css') > -1) return html;
  const css = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wdth,wght@62.5..100,200..400&display=swap"><style id="sfvs-css">
.xv{--xn:#F5F1EA;--xn2:#EDE7DC;--xc:#111110;--xc2:#4A463F;--xl:rgba(17,17,16,.13);--xg:#6F695E;--xg2:#111110;--xt:#111110;--mono:Commissioner,system-ui,sans-serif;--display:'Noto Serif Display',Literata,Georgia,serif;background:var(--xn);color:var(--xc)}
.xv h1,.xv h2,.xv h3{font-family:'Noto Serif Display',Literata,Georgia,serif;font-stretch:68%;font-weight:300;text-transform:uppercase;letter-spacing:-.005em;line-height:.98}
.xv h1{font-size:clamp(52px,9.6vw,136px)}
.xv h2{font-size:clamp(40px,6.2vw,88px);line-height:.98}
.xv h3{font-size:clamp(24px,2.6vw,34px)}
.xv h1 em,.xv h2 em,.xv h3 em{font-style:normal;color:inherit;opacity:.62}
.xv-k,.xv-cap,.xv-foot{font-family:Commissioner,system-ui,sans-serif!important;font-weight:400!important;letter-spacing:.3em!important}
.xv-k{font-size:10.5px!important;color:var(--xg)!important}
.xv-cap{color:#7A7468!important}
.xv-p,.xv-lede{font-weight:300}
.xv .btn{background:#111110;border-color:#111110;color:#fff;border-radius:999px;letter-spacing:.2em;text-transform:uppercase;font-size:11.5px;font-weight:500}
.xv .btn.ghost{background:transparent;color:#111110;border-color:rgba(17,17,16,.5)}
.xv-hero,.xv-full,.xv-end,.xv-band,.xv-split .xv-m1{--xc:#FFFFFF;--xc2:#ECE7DD;--xg:#ECE7DD;--xg2:#FFFFFF;--xl:rgba(255,255,255,.22)}
.xv-hero h1,.xv-full h2,.xv-end h2,.xv-band h2{color:#fff}
.xv-hero .btn,.xv-end .btn,.xv-band .btn{background:#fff;border-color:#fff;color:#111110}
.xv-hero .btn.ghost,.xv-end .btn.ghost,.xv-band .btn.ghost{background:rgba(255,255,255,.06);color:#fff;border-color:rgba(255,255,255,.7)}
.xv-excl{background:#fff!important;color:#111110!important;font-family:Commissioner,system-ui,sans-serif!important}
.xv-excl .xv-dot{background:#111110!important}
.xv-stats b,.xv-dist b,.xv-lv b,.xv-tax b,.xv-bars b{font-family:'Noto Serif Display',Georgia,serif!important;font-stretch:66%;font-weight:200!important;color:#111110!important;letter-spacing:0!important}
.xv-dist small,.xv-stats small{font-family:Commissioner,sans-serif!important;color:#6F695E!important;letter-spacing:.1em}
.xv-dist li{border-color:var(--xl)!important}
.xv-loc{background:#EDE7DC}
.xv-plans,.xv-plans .xv-plan{--xn:#0E1A28;--xn2:#132234;--xc:#F2EBDD;--xc2:#B9BDC2;--xl:#223040;--xg:#C9B48A;background:#0E1A28;color:#F2EBDD}
.xv-plans h2{color:#F2EBDD}
.xv-form input,.xv-form select,.xv-form textarea{background:#fff!important;color:#111110!important;border-color:rgba(17,17,16,.2)!important}
.xv ::selection{background:#111110;color:#fff}
.sfv{background:#111110!important}
.sfv h2{font-family:'Noto Serif Display',Literata,Georgia,serif!important;font-stretch:68%;text-transform:uppercase;line-height:.98!important;font-size:clamp(40px,6vw,84px)!important}
.sfv-k{color:#ECE7DD!important}
.sfv-n{font-family:'Noto Serif Display',Literata,Georgia,serif!important;font-stretch:76%;font-weight:300}
.sfv-m{color:#A9A397!important}
.sfv-all{border-color:rgba(255,255,255,.6)!important;letter-spacing:.24em!important}
.sfv-all:hover{background:#fff!important;color:#111110!important}
</style>`;
  return html.replace('</head>', css + '</head>');
}

// ===== Voula villa: corrected facts from the owner (29/10/2026) =====
function sfVillaFacts(path, html) {
  if (!/\/(villes\/voula-alyos-3|villas\/voula-alyos-3|villas\/voula)\/$/.test(path) || html.indexOf('sfvf-ok') > -1) return html;
  const el = path.startsWith('/villes/'), en = path.startsWith('/en/');
  let t = html;
  const rep = (re, s) => { t = t.replace(re, s); };
  // numbers (all languages)
  rep(/data-count="126[.,]48" data-dec="2"/g, 'data-count="141" data-dec="0"');
  rep(/\b126[.,]48\b/g, '141');
  rep(/data-count="75[.,]9" data-dec="2"/g, 'data-count="78" data-dec="0"');
  rep(/\b75[.,]90?\b/g, '78');
  rep(/data-count="50[.,]58" data-dec="2"/g, 'data-count="63" data-dec="0"');
  rep(/\b50[.,]58\b/g, '63');
  rep(/data-count="32[.,]56" data-dec="2"/g, 'data-count="34" data-dec="0"');
  rep(/\b32[.,]56\b/g, '34');
  rep(/\b6[.,]48((?:\s|&nbsp;)*(?:m²|τ\.μ\.|מ״ר|м²))/g, '21$1');
  rep(/data-count="152"/g, 'data-count="150"');
  rep(/\b152(?=(?:\s|&nbsp;)*(?:m²|τ\.μ|מ״ר|м²|<\/span>|<small>))/g, '150');
  rep(/&lt;\s?(?=<span data-count="400")/g, '');
  rep(/&lt;\s?400/g, '250');
  rep(/<span data-count="400" data-dec="0">400<\/span>/g, '<span data-count="250" data-dec="0">250</span>');
  rep(/(<b>|\s)<400(?=<small>|\s)/g, '$1250');
  if (!el && !en) rep(/\b400(\s?(?:m|м|מ׳|米|م)(?![a-zA-Z]))/g, '250$1');
  rep(/(λιγότερο από|κάτω από)\s400\sμ\./g, '250 μ.');
  rep(/(under|less than)\s400\sm\b/gi, '250 m');
  rep(/✓\s*49%\s*/g, '✓ ');
  if (el) {
    rep(/✓ πάνω από το όριο/g, '✓ Πάνω από το όριο');
    rep(/Νεόδμητη μεζονέτα/g, 'Νεόδμητη ισόγεια μεζονέτα');
    rep(/Εμβαδά από την(?:<br>|\s)*οικοδομική άδεια/g, 'Εμβαδά<br>κατοικίας');
    rep('Το υπόγειο είναι βοηθητικός χώρος και αναφέρεται χωριστά.', 'Μαζί με το playroom των 34 τ.μ.: <b>175 τ.μ.</b> Κάθε επίπεδο έχει δική του είσοδο από τον εξωτερικό ανελκυστήρα.');
    rep('Δύο υπνοδωμάτια, το ένα με ανοιχτή ντουλάπα και δικό του μπάνιο, με θέα στο σαλόνι.', 'Δύο master υπνοδωμάτια, το καθένα με δικό του μπάνιο, και walk-in ντουλάπα.');
    rep('Σαλόνι διπλού ύψους που ανοίγει στην πισίνα, κουζίνα με νησίδα, κύριο υπνοδωμάτιο με μπάνιο και πόρτα στον κήπο.', 'Σαλόνι με απευθείας πρόσβαση στην πισίνα, open κουζίνα με νησίδα, τραπεζαρία, master υπνοδωμάτιο με δικό του μπάνιο και έξοδο στον κήπο, WC.');
    rep(/<h3>Βοηθητικός χώρος<\/h3>/g, '<h3>Playroom</h3>');
    rep('Παιδότοπος, γυμναστήριο ή επιπλέον δωμάτιο. Θέση στάθμευσης στο γκαράζ του υπογείου.', 'Ιδανικό και για γυμναστήριο, γραφείο ή χώρο ψυχαγωγίας. Θέση στάθμευσης σε κλειστό γκαράζ.');
    rep('<li>Βοηθητικός χώρος υπογείου 34 τ.μ.</li>', '<li>Playroom 34 τ.μ.</li><li>Smart home</li><li>Ανελκυστήρας με είσοδο σε κάθε επίπεδο</li>');
    rep('<li>Θέση στάθμευσης σε γκαράζ</li>', '<li>Θέση στάθμευσης σε κλειστό γκαράζ</li><li>Κοντά στην αγορά, στο Ασκληπιείο Βούλας</li>');
  }
  if (en) {
    rep(/✓ above the threshold/gi, '✓ Above the threshold');
    rep(/A new-build maisonette/g, 'A new-build ground-floor maisonette');
    rep(/New-build 141 m² maisonette/g, 'New-build ground-floor maisonette, 141 m²,');
    rep(/Areas taken from the(?:<br>|\s)*building permit/g, 'Areas<br>of the home');
    rep('. The basement is an auxiliary room and is listed separately.', '. With the 34 m² playroom: <b>175 m²</b>. Every level has its own entrance from the external lift.');
    rep('Two bedrooms, one with an open walk-in wardrobe and private bathroom, overlooking the living room.', 'Two master bedrooms, each with its own bathroom, and a walk-in wardrobe.');
    rep('Double-height living room opening onto the pool, kitchen with island, master bedroom with en-suite and garden door.', 'Living room opening straight onto the pool, open kitchen with island, dining area, master bedroom with en-suite and garden door, guest WC.');
    rep(/<h3>Auxiliary (room|space)<\/h3>/g, '<h3>Playroom</h3>');
    rep('Playroom, gym or extra room. Parking space in the basement garage.', 'Ideal as a gym, office or entertainment room. Parking space in the closed garage.');
    rep('<li>Basement auxiliary room 34 m²</li>', '<li>Playroom 34 m²</li><li>Smart home</li><li>Lift with its own entrance to every level</li>');
    rep('<li>Garage parking space</li>', '<li>Parking in a closed garage</li><li>Close to the shops at Asklipieio Voulas</li>');
  }
  if (!el && !en) rep(/השטחים לקוחים מהיתר הבנייה\.\s*/g, '');
  return t.replace('</head>', '<meta name="sfvf-ok" content="1"></head>');
}
