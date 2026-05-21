-- Seed multilingual farming tips from the curated 50-tip dataset.
-- The app stores one row per language, so this migration inserts 150 rows.

ALTER TABLE public.farming_tips
  ADD COLUMN IF NOT EXISTS dataset_id INTEGER,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS season TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS farming_tips_dataset_language_idx
  ON public.farming_tips (dataset_id, language);

WITH seed(dataset_id, crop_type, category, season, language, title, description, source) AS (
  VALUES
  (1, 'Rice', 'Soil Preparation', 'Kharif', 'en', $$Puddling for Wetland Rice$$, $$Puddle the field 2-3 times after flooding to create a hard pan that reduces water percolation. Ideal puddling depth is 15-20 cm. This reduces water loss by up to 30%.$$, 'ICAR'),
  (1, 'Rice', 'Soil Preparation', 'Kharif', 'hi', $$गीले धान के लिए पडलिंग$$, $$खेत में पानी भरने के बाद 2-3 बार पडलिंग करें, ताकि कड़ी परत बने और पानी का रिसाव कम हो. 15-20 सेमी गहराई आदर्श है और पानी की बचत 30% तक हो सकती है.$$, 'ICAR'),
  (1, 'Rice', 'Soil Preparation', 'Kharif', 'gu', $$ભીના ડાંગર માટે પેડલિંગ$$, $$ખેતરમાં પાણી ભર્યા પછી 2-3 વખત પેડલિંગ કરો જેથી કઠણ પડ બને અને પાણીનું ઝરવું ઘટે. 15-20 સેમી ઊંડાઈ યોગ્ય છે અને પાણીની બચત 30% સુધી થઈ શકે છે.$$, 'ICAR'),

  (2, 'Rice', 'Seed & Sowing', 'Kharif', 'en', $$Seed Treatment Before Sowing$$, $$Soak seeds in 1% salt water and discard floating seeds. Treat seed with Carbendazim 2 g/kg to prevent blast and sheath blight. Use 20-25 kg seed per acre for transplanted rice.$$, 'ICAR'),
  (2, 'Rice', 'Seed & Sowing', 'Kharif', 'hi', $$बुवाई से पहले बीज उपचार$$, $$बीजों को 1% नमक पानी में भिगोएं और तैरते बीज निकाल दें. ब्लास्ट और शीथ ब्लाइट से बचाव के लिए कार्बेन्डाजिम 2 ग्राम/किलो बीज से उपचार करें. रोपाई वाले धान के लिए 20-25 किलो/एकड़ बीज रखें.$$, 'ICAR'),
  (2, 'Rice', 'Seed & Sowing', 'Kharif', 'gu', $$વાવણી પહેલાં બીજ ઉપચાર$$, $$બીજને 1% મીઠાં પાણીમાં પલાળો અને તરતાં બીજ કાઢી નાખો. બ્લાસ્ટ અને શીથ બ્લાઇટથી બચવા કાર્બેન્ડાઝિમ 2 ગ્રામ/કિલો બીજથી ઉપચાર કરો. રોપણી ડાંગર માટે 20-25 કિલો/એકર બીજ વાપરો.$$, 'ICAR'),

  (3, 'Rice', 'Water Management', 'Kharif', 'en', $$Alternate Wetting and Drying (AWD)$$, $$After transplanting, keep 2-5 cm standing water. Let the field dry until light soil cracks appear, usually 5-7 days, then irrigate again. AWD saves 15-30% water without yield loss.$$, 'IRRI'),
  (3, 'Rice', 'Water Management', 'Kharif', 'hi', $$बारी-बारी गीला और सूखा सिंचाई तरीका$$, $$रोपाई के बाद 2-5 सेमी पानी रखें. मिट्टी में हल्की दरारें आने तक 5-7 दिन खेत सूखने दें और फिर सिंचाई करें. यह तरीका बिना उपज घटाए 15-30% पानी बचाता है.$$, 'IRRI'),
  (3, 'Rice', 'Water Management', 'Kharif', 'gu', $$વારાફરતી ભીનું અને સૂકું સિંચાઈ પદ્ધતિ$$, $$રોપણી પછી 2-5 સેમી પાણી રાખો. જમીનમાં હળવી ચીરો પડે ત્યાં સુધી 5-7 દિવસ ખેતર સુકાવા દો અને પછી ફરી સિંચાઈ કરો. આ પદ્ધતિ ઉપજ ઘટાડ્યા વગર 15-30% પાણી બચાવે છે.$$, 'IRRI'),

  (4, 'Rice', 'Fertilizer', 'Kharif', 'en', $$Split Nitrogen Application$$, $$Apply nitrogen in 3 splits: 50% basal, 25% at active tillering around 21 DAT, and 25% at panicle initiation around 45 DAT. Recommended total dose is 120 kg N/ha for high-yielding varieties.$$, 'ICAR'),
  (4, 'Rice', 'Fertilizer', 'Kharif', 'hi', $$नाइट्रोजन को किस्तों में दें$$, $$नाइट्रोजन 3 भागों में दें: 50% बेसल, 25% सक्रिय टिलरिंग पर लगभग 21 DAT और 25% पैनिकल बनने पर लगभग 45 DAT. उच्च उपज किस्मों के लिए कुल 120 किलो N/हेक्टेयर दें.$$, 'ICAR'),
  (4, 'Rice', 'Fertilizer', 'Kharif', 'gu', $$નાઇટ્રોજન હપ્તામાં આપો$$, $$નાઇટ્રોજન 3 ભાગમાં આપો: 50% પાયામાં, 25% સક્રિય ટિલરિંગ સમયે આશરે 21 DAT અને 25% પેનિકલ શરૂઆત સમયે આશરે 45 DAT. ઊંચી ઉપજ જાત માટે કુલ 120 કિગ્રા N/હે. ભલામણ છે.$$, 'ICAR'),

  (5, 'Rice', 'Pest Control', 'Kharif', 'en', $$Stem Borer Management$$, $$Install pheromone traps at 5 per acre from 15 DAT. If dead heart exceeds 5% or white ear exceeds 2%, spray Chlorpyrifos 2.5 ml/litre. Remove egg masses manually from the nursery.$$, 'TNAU'),
  (5, 'Rice', 'Pest Control', 'Kharif', 'hi', $$तना छेदक प्रबंधन$$, $$15 DAT से प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं. डेड हार्ट 5% या व्हाइट ईयर 2% से अधिक हो तो क्लोरपायरीफॉस 2.5 मिली/लीटर छिड़कें. नर्सरी से अंड समूह हाथ से हटाएं.$$, 'TNAU'),
  (5, 'Rice', 'Pest Control', 'Kharif', 'gu', $$તણા છિદ્રક જીવાત નિયંત્રણ$$, $$15 DATથી પ્રતિ એકર 5 ફેરોમોન ટ્રેપ લગાવો. ડેડ હાર્ટ 5% અથવા સફેદ કાંસ 2%થી વધારે હોય તો ક્લોરપાયરિફોસ 2.5 મિલી/લિટર છાંટો. નર્સરીમાંથી ઈંડાના સમૂહ હાથથી દૂર કરો.$$, 'TNAU'),

  (6, 'Rice', 'Disease Management', 'Kharif', 'en', $$Blast Disease Prevention$$, $$Spray Tricyclazole 0.6 g/litre at tillering and booting stages. Avoid excess nitrogen in blast-prone areas. Use resistant varieties such as Pusa Basmati 1692 where suitable.$$, 'ICAR'),
  (6, 'Rice', 'Disease Management', 'Kharif', 'hi', $$ब्लास्ट रोग से बचाव$$, $$टिलरिंग और बूटिंग अवस्था पर ट्राइसाइक्लाजोल 0.6 ग्राम/लीटर छिड़कें. ब्लास्ट वाले क्षेत्रों में अधिक नाइट्रोजन से बचें. उपयुक्त हो तो पूसा बासमती 1692 जैसी प्रतिरोधी किस्में लें.$$, 'ICAR'),
  (6, 'Rice', 'Disease Management', 'Kharif', 'gu', $$બ્લાસ્ટ રોગથી બચાવ$$, $$ટિલરિંગ અને બૂટિંગ સમયે ટ્રાઇસાયક્લાઝોલ 0.6 ગ્રામ/લિટર છાંટો. બ્લાસ્ટવાળા વિસ્તારમાં વધારે નાઇટ્રોજન ટાળો. યોગ્ય હોય તો પૂસા બાસમતી 1692 જેવી પ્રતિરોધક જાત વાવો.$$, 'ICAR'),

  (7, 'Rice', 'Harvesting', 'Kharif', 'en', $$Optimal Harvest Timing$$, $$Harvest when 80-85% grains turn golden yellow, usually 25-30 days after 50% flowering. Grain moisture should be 20-22% at harvest and 14% for storage. Delay causes shattering loss.$$, 'ICAR'),
  (7, 'Rice', 'Harvesting', 'Kharif', 'hi', $$कटाई का सही समय$$, $$जब 80-85% दाने सुनहरे पीले हो जाएं, सामान्यतः 50% फूल आने के 25-30 दिन बाद, कटाई करें. कटाई पर नमी 20-22% और भंडारण के लिए 14% होनी चाहिए. देरी से दाने झड़ते हैं.$$, 'ICAR'),
  (7, 'Rice', 'Harvesting', 'Kharif', 'gu', $$કાપણીનો યોગ્ય સમય$$, $$80-85% દાણા સોનેરી પીળા થાય ત્યારે, સામાન્ય રીતે 50% ફૂલ આવ્યા પછી 25-30 દિવસે, કાપણી કરો. કાપણી સમયે ભેજ 20-22% અને સંગ્રહ માટે 14% રાખો. મોડું કરવાથી દાણા ખરે છે.$$, 'ICAR'),

  (8, 'Rice', 'Post-Harvest', 'Kharif', 'en', $$Proper Drying and Storage$$, $$Sun-dry harvested grain to 14% moisture before storage. Use hermetic bags or metal silos to prevent weevils. Do not store jute bags directly on the floor.$$, 'FCI'),
  (8, 'Rice', 'Post-Harvest', 'Kharif', 'hi', $$सही सुखाई और भंडारण$$, $$भंडारण से पहले कटे धान को धूप में सुखाकर नमी 14% करें. घुन से बचने के लिए हर्मेटिक बैग या धातु साइलो इस्तेमाल करें. जूट बैग सीधे फर्श पर न रखें.$$, 'FCI'),
  (8, 'Rice', 'Post-Harvest', 'Kharif', 'gu', $$યોગ્ય સુકવણી અને સંગ્રહ$$, $$સંગ્રહ પહેલાં કાપેલા દાણાને ધુપમાં સુકવી ભેજ 14% કરો. ઘૂણથી બચવા હર્મેટિક બેગ અથવા ધાતુ સાયલો વાપરો. જ્યુટ બેગ સીધા જમીન પર ન મૂકો.$$, 'FCI'),

  (9, 'Wheat', 'Soil Preparation', 'Rabi', 'en', $$Deep Ploughing Before Sowing$$, $$Deep plough to 25-30 cm once in 3 years to break the plough pan, improve drainage, and expose soil pests to sunlight. Follow with 2-3 harrowings and planking for fine tilth.$$, 'ICAR'),
  (9, 'Wheat', 'Soil Preparation', 'Rabi', 'hi', $$बुवाई से पहले गहरी जुताई$$, $$हर 3 वर्ष में एक बार 25-30 सेमी गहरी जुताई करें ताकि कड़ी परत टूटे, जल निकास सुधरे और मिट्टी के कीट धूप में आएं. फिर 2-3 हैरो और पाटा चलाकर भुरभुरी मिट्टी बनाएं.$$, 'ICAR'),
  (9, 'Wheat', 'Soil Preparation', 'Rabi', 'gu', $$વાવણી પહેલાં ઊંડી ખેડ$$, $$દર 3 વર્ષે એક વાર 25-30 સેમી ઊંડી ખેડ કરો જેથી કઠણ પડ તૂટે, નિકાસ સુધરે અને જમીનની જીવાત સૂર્યપ્રકાશે આવે. પછી 2-3 હેરો અને પાટા મારી ઝીણી માવજત કરો.$$, 'ICAR'),

  (10, 'Wheat', 'Seed & Sowing', 'Rabi', 'en', $$Timely Sowing Window$$, $$Sow irrigated wheat between Nov 1-25 for best yield. Late sowing after Dec 15 can reduce yield by 35-40 kg/ha/day due to terminal heat. Use 100 kg seed/ha and 22.5 cm row spacing.$$, 'PAU Ludhiana'),
  (10, 'Wheat', 'Seed & Sowing', 'Rabi', 'hi', $$समय पर गेहूं बुवाई$$, $$सिंचित गेहूं 1-25 नवंबर के बीच बोएं. 15 दिसंबर के बाद बुवाई से अंतिम गर्मी के कारण 35-40 किलो/हेक्टेयर/दिन उपज घट सकती है. 100 किलो बीज/हेक्टेयर और 22.5 सेमी कतार दूरी रखें.$$, 'PAU Ludhiana'),
  (10, 'Wheat', 'Seed & Sowing', 'Rabi', 'gu', $$સમયસર ઘઉં વાવણી$$, $$સિંચિત ઘઉં 1-25 નવેમ્બર વચ્ચે વાવો. 15 ડિસેમ્બર પછી વાવણીથી અંતિમ ગરમીને કારણે 35-40 કિગ્રા/હે./દિવસ ઉપજ ઘટી શકે છે. 100 કિગ્રા બીજ/હે. અને 22.5 સેમી કતાર અંતર રાખો.$$, 'PAU Ludhiana'),

  (11, 'Wheat', 'Fertilizer', 'Rabi', 'en', $$Balanced NPK for High Yield$$, $$Apply 120:60:40 kg NPK/ha. Give full P and K plus 50% N as basal at sowing. Apply remaining N at first irrigation, the CRI stage around 21 DAS. For zinc deficiency, apply ZnSO4 25 kg/ha.$$, 'ICAR'),
  (11, 'Wheat', 'Fertilizer', 'Rabi', 'hi', $$अधिक उपज के लिए संतुलित NPK$$, $$120:60:40 किलो NPK/हेक्टेयर दें. पूरा P और K तथा 50% N बुवाई के समय दें. शेष N पहली सिंचाई, यानी CRI अवस्था लगभग 21 DAS पर दें. जिंक कमी में ZnSO4 25 किलो/हेक्टेयर दें.$$, 'ICAR'),
  (11, 'Wheat', 'Fertilizer', 'Rabi', 'gu', $$વધુ ઉપજ માટે સંતુલિત NPK$$, $$120:60:40 કિગ્રા NPK/હે. આપો. પૂરું P અને K તથા 50% N વાવણી સમયે આપો. બાકી N પ્રથમ સિંચાઈ, CRI અવસ્થા આશરે 21 DAS પર આપો. ઝીંકની અછત હોય તો ZnSO4 25 કિગ્રા/હે. આપો.$$, 'ICAR'),

  (12, 'Wheat', 'Water Management', 'Rabi', 'en', $$Critical Irrigation Stages$$, $$Five irrigations are critical: CRI at 21 DAS, tillering at 40 DAS, jointing at 60 DAS, flowering at 80 DAS, and grain filling at 100 DAS. Do not skip them; grain filling irrigation alone can increase yield by 15%.$$, 'ICAR'),
  (12, 'Wheat', 'Water Management', 'Rabi', 'hi', $$महत्वपूर्ण सिंचाई अवस्थाएं$$, $$5 सिंचाइयां बहुत जरूरी हैं: CRI 21 DAS, टिलरिंग 40 DAS, जॉइंटिंग 60 DAS, फूल 80 DAS और दाना भराई 100 DAS. इन्हें न छोड़ें; केवल दाना भराई सिंचाई से भी 15% उपज बढ़ सकती है.$$, 'ICAR'),
  (12, 'Wheat', 'Water Management', 'Rabi', 'gu', $$મહત્વની સિંચાઈ અવસ્થાઓ$$, $$5 સિંચાઈ જરૂરી છે: CRI 21 DAS, ટિલરિંગ 40 DAS, જોઇન્ટિંગ 60 DAS, ફૂલ 80 DAS અને દાણા ભરાવ 100 DAS. તેને ન છોડો; માત્ર દાણા ભરાવની સિંચાઈથી પણ 15% ઉપજ વધી શકે છે.$$, 'ICAR'),

  (13, 'Wheat', 'Pest Control', 'Rabi', 'en', $$Aphid Management$$, $$Monitor aphids from January. If there are more than 10 aphids per tiller, spray Dimethoate 30 EC at 1 litre/ha or Imidacloprid 17.8 SL at 200 ml/ha. Avoid spraying during flowering to protect pollinators.$$, 'TNAU'),
  (13, 'Wheat', 'Pest Control', 'Rabi', 'hi', $$माहू नियंत्रण$$, $$जनवरी से माहू की निगरानी करें. यदि प्रति टिलर 10 से अधिक माहू हों तो डाइमेथोएट 30 EC 1 लीटर/हेक्टेयर या इमिडाक्लोप्रिड 17.8 SL 200 मिली/हेक्टेयर छिड़कें. परागण कीटों की सुरक्षा के लिए फूल अवस्था में छिड़काव न करें.$$, 'TNAU'),
  (13, 'Wheat', 'Pest Control', 'Rabi', 'gu', $$માહુ નિયંત્રણ$$, $$જાન્યુઆરીથી માહુની દેખરેખ રાખો. પ્રતિ ટિલર 10થી વધુ માહુ હોય તો ડાઇમેથોએટ 30 EC 1 લિટર/હે. અથવા ઇમિડાક્લોપ્રિડ 17.8 SL 200 મિલી/હે. છાંટો. પરાગણ જીવ બચાવવા ફૂલ સમયે છંટકાવ ટાળો.$$, 'TNAU'),

  (14, 'Wheat', 'Disease Management', 'Rabi', 'en', $$Yellow Rust Control$$, $$Scout fields weekly from January. At the first sign of yellow rust, spray Propiconazole 25 EC at 500 ml/ha or Tebuconazole at 625 ml/ha. Prefer resistant varieties such as HD 3086 and GW 496.$$, 'ICAR'),
  (14, 'Wheat', 'Disease Management', 'Rabi', 'hi', $$पीला रतुआ नियंत्रण$$, $$जनवरी से हर सप्ताह खेत देखें. पीला रतुआ दिखते ही प्रोपिकोनाजोल 25 EC 500 मिली/हेक्टेयर या टेबुकोनाजोल 625 मिली/हेक्टेयर छिड़कें. HD 3086 और GW 496 जैसी प्रतिरोधी किस्में लें.$$, 'ICAR'),
  (14, 'Wheat', 'Disease Management', 'Rabi', 'gu', $$પીળો રસ્ટ નિયંત્રણ$$, $$જાન્યુઆરીથી દર અઠવાડિયે ખેતરની તપાસ કરો. પીળો રસ્ટ દેખાય ત્યારે પ્રોપિકોનાઝોલ 25 EC 500 મિલી/હે. અથવા ટેબુકોનાઝોલ 625 મિલી/હે. છાંટો. HD 3086 અને GW 496 જેવી પ્રતિરોધક જાત પસંદ કરો.$$, 'ICAR'),

  (15, 'Wheat', 'Weed Management', 'Rabi', 'en', $$Narrow-leaf and Broad-leaf Weed Control$$, $$For Phalaris minor, spray Clodinafop 60 WP at 400 g/ha at 30-35 DAS. For mixed weeds, use Isoproturon plus 2,4-D combination. Spray in the morning with 20-30 L/ha water volume.$$, 'PAU'),
  (15, 'Wheat', 'Weed Management', 'Rabi', 'hi', $$संकरी और चौड़ी पत्ती खरपतवार नियंत्रण$$, $$फैलेरिस माइनर के लिए 30-35 DAS पर क्लोडिनाफॉप 60 WP 400 ग्राम/हेक्टेयर छिड़कें. मिश्रित खरपतवार के लिए आइसोप्रोट्यूरॉन + 2,4-D संयोजन लें. सुबह 20-30 लीटर/हेक्टेयर पानी में छिड़कें.$$, 'PAU'),
  (15, 'Wheat', 'Weed Management', 'Rabi', 'gu', $$સાંકડી અને પહોળી પાંદડીના નીંદણ નિયંત્રણ$$, $$ફેલેરિસ માઇનર માટે 30-35 DAS પર ક્લોડિનાફોપ 60 WP 400 ગ્રામ/હે. છાંટો. મિશ્ર નીંદણ માટે આઇસોપ્રોટ્યુરોન + 2,4-D સંયોજન વાપરો. સવારે 20-30 લિટર/હે. પાણીમાં છંટકાવ કરો.$$, 'PAU'),

  (16, 'Wheat', 'Harvesting', 'Rabi', 'en', $$Harvest at Right Maturity$$, $$Harvest when grains are hard and straw turns golden, with grain moisture around 20%. Set combine harvester cylinder speed at 450-500 RPM to reduce breakage. Avoid delays because rain after maturity can cause sprouting.$$, 'ICAR'),
  (16, 'Wheat', 'Harvesting', 'Rabi', 'hi', $$सही पकाव पर कटाई$$, $$जब दाने सख्त और भूसा सुनहरा हो जाए तथा नमी लगभग 20% हो, तब कटाई करें. दाना टूटना कम करने के लिए कंबाइन सिलिंडर गति 450-500 RPM रखें. पकने के बाद बारिश से अंकुरण हो सकता है, इसलिए देरी न करें.$$, 'ICAR'),
  (16, 'Wheat', 'Harvesting', 'Rabi', 'gu', $$યોગ્ય પાકાવ પર કાપણી$$, $$દાણા કઠણ અને પાંખડી સોનેરી થાય તથા ભેજ આશરે 20% હોય ત્યારે કાપણી કરો. દાણા તૂટવાનું ઓછું કરવા કોમ્બાઇન સિલિન્ડર ઝડપ 450-500 RPM રાખો. પાક્યા પછી વરસાદથી અંકુરણ થઈ શકે છે, તેથી મોડું ન કરો.$$, 'ICAR'),

  (17, 'Cotton', 'Soil Preparation', 'Kharif', 'en', $$Deep Summer Ploughing$$, $$Deep plough to 30 cm in April-May to expose and kill Helicoverpa pupae in the soil. Add 10-15 tonnes FYM/ha as basal manure and mix it during the last harrowing.$$, 'CICR'),
  (17, 'Cotton', 'Soil Preparation', 'Kharif', 'hi', $$गर्मी में गहरी जुताई$$, $$अप्रैल-मई में 30 सेमी गहरी जुताई करें ताकि मिट्टी में छिपे हेलिकोवर्पा प्यूपा धूप में आकर नष्ट हों. 10-15 टन FYM/हेक्टेयर बेसल खाद दें और अंतिम हैरो में मिला दें.$$, 'CICR'),
  (17, 'Cotton', 'Soil Preparation', 'Kharif', 'gu', $$ઉનાળામાં ઊંડી ખેડ$$, $$એપ્રિલ-મેમાં 30 સેમી ઊંડી ખેડ કરો જેથી જમીનમાં રહેલા હેલિકોવર્પા પ્યુપા બહાર આવી નષ્ટ થાય. 10-15 ટન FYM/હે. પાયામાં આપો અને છેલ્લી હેરોમાં ભેળવો.$$, 'CICR'),

  (18, 'Cotton', 'Seed & Sowing', 'Kharif', 'en', $$Bt Cotton Sowing Guidelines$$, $$Sow Bt cotton from May 15 to June 15. Keep 60 x 90 cm spacing for hybrid Bt cotton. Sow 10% non-Bt refuge rows on field borders to delay bollworm resistance.$$, 'CICR'),
  (18, 'Cotton', 'Seed & Sowing', 'Kharif', 'hi', $$Bt कपास बुवाई मार्गदर्शन$$, $$Bt कपास 15 मई से 15 जून तक बोएं. हाइब्रिड Bt कपास में 60 x 90 सेमी दूरी रखें. बॉलवर्म प्रतिरोध देरी से आए इसके लिए खेत किनारे 10% non-Bt रिफ्यूज कतारें बोएं.$$, 'CICR'),
  (18, 'Cotton', 'Seed & Sowing', 'Kharif', 'gu', $$Bt કપાસ વાવણી માર્ગદર્શન$$, $$Bt કપાસ 15 મે થી 15 જૂન સુધી વાવો. હાઇબ્રિડ Bt કપાસ માટે 60 x 90 સેમી અંતર રાખો. બોલવોર્મમાં પ્રતિરોધ મોડો આવે માટે ખેતરની કિનારે 10% non-Bt રિફ્યુજ કતાર વાવો.$$, 'CICR'),

  (19, 'Cotton', 'Fertilizer', 'Kharif', 'en', $$Nutrient Management for Bt Hybrids$$, $$Bt hybrids need higher nutrition: 150:75:75 kg NPK/ha. Apply N in 4 splits at basal, 30 DAS, 60 DAS, and 90 DAS. Foliar spray of 2% urea at boll development improves boll weight by 8-10%.$$, 'CICR'),
  (19, 'Cotton', 'Fertilizer', 'Kharif', 'hi', $$Bt हाइब्रिड में पोषण प्रबंधन$$, $$Bt हाइब्रिड को अधिक पोषण चाहिए: 150:75:75 किलो NPK/हेक्टेयर. N को 4 भागों में दें: बेसल, 30 DAS, 60 DAS और 90 DAS. बॉल विकास पर 2% यूरिया छिड़काव बॉल वजन 8-10% बढ़ाता है.$$, 'CICR'),
  (19, 'Cotton', 'Fertilizer', 'Kharif', 'gu', $$Bt હાઇબ્રિડમાં પોષણ વ્યવસ્થાપન$$, $$Bt હાઇબ્રિડને વધુ પોષણ જોઈએ: 150:75:75 કિગ્રા NPK/હે. Nને 4 ભાગમાં આપો: પાયામાં, 30 DAS, 60 DAS અને 90 DAS. બોલ વિકાસ સમયે 2% યુરિયા છંટકાવ બોલ વજન 8-10% વધારે છે.$$, 'CICR'),

  (20, 'Cotton', 'Water Management', 'Kharif', 'en', $$Irrigation Scheduling$$, $$Cotton is sensitive to water stress at squaring and boll development. Irrigate at 50% field capacity during vegetative growth and every 10-12 days during boll development. Drip can save 40% water and increase yield by 20%.$$, 'ICAR'),
  (20, 'Cotton', 'Water Management', 'Kharif', 'hi', $$सिंचाई समय-सारणी$$, $$कपास स्क्वेयरिंग और बॉल विकास पर पानी की कमी से प्रभावित होती है. वनस्पति अवस्था में 50% फील्ड कैपेसिटी पर और बॉल विकास में हर 10-12 दिन सिंचाई करें. ड्रिप 40% पानी बचाकर 20% उपज बढ़ा सकती है.$$, 'ICAR'),
  (20, 'Cotton', 'Water Management', 'Kharif', 'gu', $$સિંચાઈ સમયપત્રક$$, $$કપાસ સ્ક્વેરિંગ અને બોલ વિકાસ સમયે પાણીની અછતથી સંવેદનશીલ છે. વનસ્પતિ અવસ્થામાં 50% ફીલ્ડ ક્ષમતા પર અને બોલ વિકાસમાં દર 10-12 દિવસે સિંચાઈ કરો. ડ્રિપ 40% પાણી બચાવી 20% ઉપજ વધારી શકે છે.$$, 'ICAR'),

  (21, 'Cotton', 'Pest Control', 'Kharif', 'en', $$Pink Bollworm IPM$$, $$Install 5 pheromone traps per acre from 40 DAS. If trap catch exceeds 8 moths/trap/week, spray Spinosad 45 SC at 160 ml/ha. Destroy cotton stubble after harvest to eliminate overwintering pupae.$$, 'CICR'),
  (21, 'Cotton', 'Pest Control', 'Kharif', 'hi', $$गुलाबी सुंडी IPM$$, $$40 DAS से प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं. यदि पकड़ 8 पतंगा/ट्रैप/सप्ताह से अधिक हो तो स्पिनोसैड 45 SC 160 मिली/हेक्टेयर छिड़कें. कटाई के बाद कपास ठूंठ नष्ट करें.$$, 'CICR'),
  (21, 'Cotton', 'Pest Control', 'Kharif', 'gu', $$ગુલાબી ઇયળ IPM$$, $$40 DASથી પ્રતિ એકર 5 ફેરોમોન ટ્રેપ લગાવો. જો પકડ 8 પતંગિયા/ટ્રેપ/અઠવાડિયા કરતાં વધુ હોય તો સ્પિનોસેડ 45 SC 160 મિલી/હે. છાંટો. કાપણી પછી કપાસના ઠૂંઠા નષ્ટ કરો.$$, 'CICR'),

  (22, 'Cotton', 'Disease Management', 'Kharif', 'en', $$Root Rot and Boll Rot Prevention$$, $$Treat seed with Trichoderma viride 4 g/kg to prevent root rot. For boll rot, spray Copper oxychloride 3 g/litre at first sign. Avoid waterlogging and keep field drainage channels open.$$, 'TNAU'),
  (22, 'Cotton', 'Disease Management', 'Kharif', 'hi', $$जड़ गलन और बॉल रॉट रोकथाम$$, $$जड़ गलन से बचाव के लिए बीज को ट्राइकोडर्मा विरिडे 4 ग्राम/किलो से उपचारित करें. बॉल रॉट दिखते ही कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर छिड़कें. जलभराव से बचें और निकास नालियां खुली रखें.$$, 'TNAU'),
  (22, 'Cotton', 'Disease Management', 'Kharif', 'gu', $$મૂલ સડ અને બોલ રોટથી બચાવ$$, $$મૂલ સડથી બચવા બીજને ટ્રાઇકોડર્મા વિરિડે 4 ગ્રામ/કિલોથી ઉપચારિત કરો. બોલ રોટ દેખાય ત્યારે કોપર ઓક્સીક્લોરાઇડ 3 ગ્રામ/લિટર છાંટો. પાણી ભરાવ ટાળો અને નિકાસ નાળીઓ ખુલ્લી રાખો.$$, 'TNAU'),

  (23, 'Cotton', 'Harvesting', 'Rabi', 'en', $$Correct Picking Technique$$, $$Pick only fully open bolls, around 80% open. Harvest in morning hours when humidity is low. Do not pick immature or wet bolls because they reduce fibre quality and grade. Aim for 3-4 pickings.$$, 'CICR'),
  (23, 'Cotton', 'Harvesting', 'Rabi', 'hi', $$सही कपास चुनाई तरीका$$, $$केवल पूरी तरह खुले बॉल, लगभग 80% खुले, चुनें. नमी कम होने पर सुबह चुनाई करें. कच्चे या गीले बॉल न चुनें क्योंकि फाइबर गुणवत्ता और ग्रेड घटते हैं. 3-4 चुनाई रखें.$$, 'CICR'),
  (23, 'Cotton', 'Harvesting', 'Rabi', 'gu', $$સાચી કપાસ વીણી પદ્ધતિ$$, $$માત્ર સંપૂર્ણ ખુલેલા બોલ, આશરે 80% ખુલેલા, વીણો. ભેજ ઓછો હોય ત્યારે સવારે વીણી કરો. કાચા અથવા ભીના બોલ ન વીણો કારણ કે ફાઇબર ગુણવત્તા અને ગ્રેડ ઘટે છે. 3-4 વીણી કરો.$$, 'CICR'),

  (24, 'Groundnut', 'Soil Preparation', 'Kharif', 'en', $$Sandy-Loam Soil Best for Groundnut$$, $$Groundnut grows best in well-drained sandy-loam soil with pH 6-6.5. Plough 20-25 cm deep and apply gypsum 200 kg/ha at pod development to prevent empty pods and aflatoxin contamination.$$, 'ICAR-NRCG'),
  (24, 'Groundnut', 'Soil Preparation', 'Kharif', 'hi', $$मूंगफली के लिए बलुई दोमट मिट्टी$$, $$मूंगफली pH 6-6.5 वाली अच्छी जल निकासी की बलुई दोमट मिट्टी में अच्छी होती है. 20-25 सेमी जुताई करें और फली विकास पर 200 किलो/हेक्टेयर जिप्सम दें, ताकि खाली फलियां और अफ्लाटॉक्सिन कम हों.$$, 'ICAR-NRCG'),
  (24, 'Groundnut', 'Soil Preparation', 'Kharif', 'gu', $$મગફળી માટે રેતાળ ગોરાડુ જમીન$$, $$મગફળી pH 6-6.5 ધરાવતી સારી નિકાસવાળી રેતાળ ગોરાડુ જમીનમાં સારી થાય છે. 20-25 સેમી ખેડ કરો અને શીંગ વિકાસ સમયે 200 કિગ્રા/હે. જિપ્સમ આપો જેથી ખાલી શીંગ અને અફ્લાટોક્સિન ઘટે.$$, 'ICAR-NRCG'),

  (25, 'Groundnut', 'Seed & Sowing', 'Kharif', 'en', $$Rhizobium Seed Inoculation$$, $$Inoculate seed with Rhizobium culture 600 g per 30 kg seed before sowing. Mix with jaggery solution as adhesive. This can fix 50-80 kg N/ha biologically and reduce chemical nitrogen need by 25%.$$, 'ICAR-NRCG'),
  (25, 'Groundnut', 'Seed & Sowing', 'Kharif', 'hi', $$राइजोबियम बीज उपचार$$, $$बुवाई से पहले 30 किलो बीज पर 600 ग्राम राइजोबियम कल्चर लगाएं. चिपकाने के लिए गुड़ घोल मिलाएं. इससे 50-80 किलो N/हेक्टेयर जैविक रूप से स्थिर हो सकता है और रासायनिक N जरूरत 25% घटती है.$$, 'ICAR-NRCG'),
  (25, 'Groundnut', 'Seed & Sowing', 'Kharif', 'gu', $$રાઇઝોબિયમ બીજ ઉપચાર$$, $$વાવણી પહેલાં 30 કિલો બીજ પર 600 ગ્રામ રાઇઝોબિયમ કલ્ચર લગાવો. ચોંટાડવા ગોળનું દ્રાવણ વાપરો. તે 50-80 કિગ્રા N/હે. જૈવિક રીતે સ્થિર કરી શકે છે અને રસાયણિક N જરૂર 25% ઘટાડે છે.$$, 'ICAR-NRCG'),

  (26, 'Groundnut', 'Fertilizer', 'Kharif', 'en', $$Gypsum Application at Pegging$$, $$Apply gypsum 200 kg/ha when 50% pegging is complete, around 30-35 DAS. Broadcast between rows without mixing into soil. Calcium from gypsum is directly absorbed by pods and improves kernel recovery.$$, 'ICAR-NRCG'),
  (26, 'Groundnut', 'Fertilizer', 'Kharif', 'hi', $$पेगिंग पर जिप्सम दें$$, $$लगभग 30-35 DAS पर 50% पेगिंग पूरी होने पर 200 किलो/हेक्टेयर जिप्सम दें. कतारों के बीच छिड़कें, मिट्टी में न मिलाएं. जिप्सम का कैल्शियम फलियों द्वारा सीधे लिया जाता है और दाना रिकवरी बढ़ती है.$$, 'ICAR-NRCG'),
  (26, 'Groundnut', 'Fertilizer', 'Kharif', 'gu', $$પેગિંગ સમયે જિપ્સમ આપો$$, $$આશરે 30-35 DAS પર 50% પેગિંગ પૂર્ણ થાય ત્યારે 200 કિગ્રા/હે. જિપ્સમ આપો. કતાર વચ્ચે છાંટો, જમીનમાં ભેળવો નહીં. જિપ્સમનું કેલ્શિયમ શીંગ સીધું લે છે અને દાણા રિકવરી વધે છે.$$, 'ICAR-NRCG'),

  (27, 'Groundnut', 'Water Management', 'Kharif', 'en', $$Critical Irrigation at Pegging and Pod Filling$$, $$Water stress at pegging, 35-45 DAS, and pod filling, 70-90 DAS, greatly reduces yield. Irrigate when soil moisture drops below 50% PWP. Drip with 60% ET replacement saves 35% water.$$, 'ICAR'),
  (27, 'Groundnut', 'Water Management', 'Kharif', 'hi', $$पेगिंग और फली भराई पर जरूरी सिंचाई$$, $$पेगिंग 35-45 DAS और फली भराई 70-90 DAS पर पानी की कमी से उपज बहुत घटती है. मिट्टी नमी 50% PWP से नीचे जाए तो सिंचाई करें. 60% ET ड्रिप से 35% पानी बचता है.$$, 'ICAR'),
  (27, 'Groundnut', 'Water Management', 'Kharif', 'gu', $$પેગિંગ અને શીંગ ભરાવ પર જરૂરી સિંચાઈ$$, $$પેગિંગ 35-45 DAS અને શીંગ ભરાવ 70-90 DAS પર પાણીની અછતથી ઉપજ બહુ ઘટે છે. માટીની ભેજ 50% PWPથી નીચે જાય તો સિંચાઈ કરો. 60% ET ડ્રિપથી 35% પાણી બચે છે.$$, 'ICAR'),

  (28, 'Groundnut', 'Pest Control', 'Kharif', 'en', $$Leaf Miner and Thrips Control$$, $$For early thrips, spray Imidacloprid 17.8 SL at 150 ml/ha. For leaf miner, apply Acephate 75 SP at 1 g/litre. Use 5 yellow sticky traps per acre for early pest detection.$$, 'TNAU'),
  (28, 'Groundnut', 'Pest Control', 'Kharif', 'hi', $$लीफ माइनर और थ्रिप्स नियंत्रण$$, $$आरंभिक थ्रिप्स के लिए इमिडाक्लोप्रिड 17.8 SL 150 मिली/हेक्टेयर छिड़कें. लीफ माइनर के लिए एसीफेट 75 SP 1 ग्राम/लीटर दें. जल्दी पहचान के लिए प्रति एकड़ 5 पीले स्टिकी ट्रैप लगाएं.$$, 'TNAU'),
  (28, 'Groundnut', 'Pest Control', 'Kharif', 'gu', $$લીફ માઇનર અને થ્રિપ્સ નિયંત્રણ$$, $$શરૂઆતના થ્રિપ્સ માટે ઇમિડાક્લોપ્રિડ 17.8 SL 150 મિલી/હે. છાંટો. લીફ માઇનર માટે એસીફેટ 75 SP 1 ગ્રામ/લિટર આપો. વહેલી ઓળખ માટે પ્રતિ એકર 5 પીળા સ્ટિકી ટ્રેપ લગાવો.$$, 'TNAU'),

  (29, 'Groundnut', 'Disease Management', 'Kharif', 'en', $$Tikka Leaf Spot Control$$, $$At the first sign of Tikka leaf spot, circular brown spots with yellow halo, spray Mancozeb 75 WP at 2.5 g/litre or Chlorothalonil at 2 g/litre. Repeat every 15 days and rotate with cereals.$$, 'ICAR-NRCG'),
  (29, 'Groundnut', 'Disease Management', 'Kharif', 'hi', $$टिक्का पत्ती धब्बा नियंत्रण$$, $$टिक्का पत्ती धब्बे के पहले लक्षण, पीली सीमा वाले गोल भूरे धब्बे, दिखें तो मैंकोजेब 75 WP 2.5 ग्राम/लीटर या क्लोरोथैलोनिल 2 ग्राम/लीटर छिड़कें. हर 15 दिन दोहराएं और अनाज फसलों से चक्र बदलें.$$, 'ICAR-NRCG'),
  (29, 'Groundnut', 'Disease Management', 'Kharif', 'gu', $$ટિક્કા પાન ડાઘ નિયંત્રણ$$, $$ટિક્કા પાન ડાઘના પ્રથમ લક્ષણ, પીળી કિનારીવાળા ગોળ ભૂરા ડાઘ, દેખાય ત્યારે મેન્કોઝેબ 75 WP 2.5 ગ્રામ/લિટર અથવા ક્લોરોથાલોનિલ 2 ગ્રામ/લિટર છાંટો. દર 15 દિવસે પુનરાવર્તન કરો અને અનાજ પાક સાથે ફેરબદલી કરો.$$, 'ICAR-NRCG'),

  (30, 'Groundnut', 'Harvesting', 'Kharif', 'en', $$Harvesting at Right Maturity$$, $$Harvest when the inner pod wall shows dark blotches and 70-75% pods are mature, usually 105-120 DAS for Kharif varieties. Harvest in dry weather and dry pods to 9-10% moisture before storage.$$, 'ICAR-NRCG'),
  (30, 'Groundnut', 'Harvesting', 'Kharif', 'hi', $$सही पकाव पर मूंगफली कटाई$$, $$जब अंदर की फली दीवार पर गहरे धब्बे हों और 70-75% फलियां पकें, सामान्यतः खरीफ किस्मों में 105-120 DAS, तब कटाई करें. सूखे मौसम में कटाई करें और भंडारण से पहले 9-10% नमी तक सुखाएं.$$, 'ICAR-NRCG'),
  (30, 'Groundnut', 'Harvesting', 'Kharif', 'gu', $$યોગ્ય પાકાવ પર મગફળી કાપણી$$, $$જ્યારે શીંગની અંદરની ભીંત પર ગાઢ ડાઘ હોય અને 70-75% શીંગ પાકી હોય, સામાન્ય રીતે ખરીફ જાતમાં 105-120 DAS, ત્યારે કાપણી કરો. સુકા હવામાનમાં કાપો અને સંગ્રહ પહેલાં 9-10% ભેજ સુધી સુકાવો.$$, 'ICAR-NRCG'),

  (31, 'Sugarcane', 'Soil Preparation', 'Annual', 'en', $$Trench Planting Method$$, $$Dig trenches 25 cm deep and 90 cm apart for planting. This improves root anchorage, reduces lodging, and helps fertilizer placement. Trench planting can give 15-20% higher yield than flat planting.$$, 'ICAR-IISR'),
  (31, 'Sugarcane', 'Soil Preparation', 'Annual', 'hi', $$ट्रेंच रोपण विधि$$, $$रोपण के लिए 25 सेमी गहरी और 90 सेमी दूर नालियां बनाएं. इससे जड़ पकड़ मजबूत होती है, गिरना घटता है और खाद सही जगह जाती है. ट्रेंच रोपण से सपाट रोपण की तुलना में 15-20% अधिक उपज मिल सकती है.$$, 'ICAR-IISR'),
  (31, 'Sugarcane', 'Soil Preparation', 'Annual', 'gu', $$ટ્રેન્ચ વાવણી પદ્ધતિ$$, $$વાવણી માટે 25 સેમી ઊંડી અને 90 સેમી અંતરની ખાઈ બનાવો. તે મૂળની પકડ મજબૂત કરે છે, પડવું ઘટાડે છે અને ખાતર યોગ્ય જગ્યાએ પહોંચે છે. ટ્રેન્ચ વાવણીથી સમતલ વાવણી કરતાં 15-20% વધુ ઉપજ મળી શકે છે.$$, 'ICAR-IISR'),

  (32, 'Sugarcane', 'Seed & Sowing', 'Annual', 'en', $$Selecting Healthy Setts$$, $$Use 3-budded setts from the top third of healthy 8-9 month old cane. Treat setts in hot water at 50 C for 2 hours to reduce ratoon stunting disease. Plant 37,000-40,000 setts/ha.$$, 'ICAR-IISR'),
  (32, 'Sugarcane', 'Seed & Sowing', 'Annual', 'hi', $$स्वस्थ सेट का चयन$$, $$8-9 माह की स्वस्थ गन्ना फसल के ऊपर के एक-तिहाई हिस्से से 3 कलियों वाले सेट लें. रैटून स्टंटिंग रोग घटाने के लिए सेट को 50 C गर्म पानी में 2 घंटे उपचारित करें. 37,000-40,000 सेट/हेक्टेयर लगाएं.$$, 'ICAR-IISR'),
  (32, 'Sugarcane', 'Seed & Sowing', 'Annual', 'gu', $$સ્વસ્થ સેટ પસંદગી$$, $$8-9 મહિનાની સ્વસ્થ શેરડીના ઉપરના એક-તૃતીયાંશ ભાગમાંથી 3 કળીવાળા સેટ લો. રેટૂન સ્ટન્ટિંગ રોગ ઘટાડવા સેટને 50 C ગરમ પાણીમાં 2 કલાક ઉપચારિત કરો. 37,000-40,000 સેટ/હે. વાવો.$$, 'ICAR-IISR'),

  (33, 'Sugarcane', 'Fertilizer', 'Annual', 'en', $$Nutrient Scheduling for Sugarcane$$, $$Apply 300:80:100 kg NPK/ha. Split nitrogen into 3 doses: one-third basal, one-third at 45 DAS, and one-third at 90 DAS. Apply micronutrient mixture with zinc and iron at 45 DAS as foliar spray.$$, 'ICAR-IISR'),
  (33, 'Sugarcane', 'Fertilizer', 'Annual', 'hi', $$गन्ने में पोषण समय-सारणी$$, $$300:80:100 किलो NPK/हेक्टेयर दें. नाइट्रोजन 3 भागों में दें: एक-तिहाई बेसल, एक-तिहाई 45 DAS और एक-तिहाई 90 DAS. 45 DAS पर जिंक और आयरन वाला सूक्ष्म पोषक मिश्रण पर्ण छिड़काव करें.$$, 'ICAR-IISR'),
  (33, 'Sugarcane', 'Fertilizer', 'Annual', 'gu', $$શેરડીમાં પોષણ સમયપત્રક$$, $$300:80:100 કિગ્રા NPK/હે. આપો. નાઇટ્રોજન 3 ભાગમાં આપો: એક તૃતિયાંશ પાયામાં, એક તૃતિયાંશ 45 DAS અને એક તૃતિયાંશ 90 DAS. 45 DAS પર ઝીંક અને લોહ ધરાવતું સૂક્ષ્મ પોષક મિશ્રણ પાન પર છાંટો.$$, 'ICAR-IISR'),

  (34, 'Sugarcane', 'Water Management', 'Annual', 'en', $$Irrigation Scheduling by Growth Stage$$, $$Sugarcane needs 1500-2500 mm water per season. Critical stages are germination, 0-30 days, and grand growth, 90-240 days. Reduce irrigation 30 days before harvest to improve sucrose. Drip saves about 40% water.$$, 'ICAR'),
  (34, 'Sugarcane', 'Water Management', 'Annual', 'hi', $$विकास अवस्था अनुसार सिंचाई$$, $$गन्ने को प्रति मौसम 1500-2500 मिमी पानी चाहिए. अंकुरण 0-30 दिन और तीव्र वृद्धि 90-240 दिन महत्वपूर्ण अवस्थाएं हैं. सुक्रोज बढ़ाने के लिए कटाई से 30 दिन पहले सिंचाई घटाएं. ड्रिप लगभग 40% पानी बचाती है.$$, 'ICAR'),
  (34, 'Sugarcane', 'Water Management', 'Annual', 'gu', $$વિકાસ અવસ્થા મુજબ સિંચાઈ$$, $$શેરડીને પ્રતિ સીઝન 1500-2500 મીમી પાણી જોઈએ. અંકુરણ 0-30 દિવસ અને મહા વૃદ્ધિ 90-240 દિવસ મહત્વની અવસ્થાઓ છે. સુક્રોઝ વધારવા કાપણીથી 30 દિવસ પહેલાં સિંચાઈ ઘટાડો. ડ્રિપ આશરે 40% પાણી બચાવે છે.$$, 'ICAR'),

  (35, 'Sugarcane', 'Pest Control', 'Annual', 'en', $$Early Shoot Borer Management$$, $$Watch for dead heart in early crop. Release Trichogramma chilonis eggs at 50,000/ha/week for 8 weeks from April. If infestation exceeds 5%, drench Chlorpyrifos 20 EC at 4 litres/ha through irrigation water.$$, 'TNAU'),
  (35, 'Sugarcane', 'Pest Control', 'Annual', 'hi', $$अर्ली शूट बोरर नियंत्रण$$, $$आरंभिक फसल में डेड हार्ट देखें. अप्रैल से 8 सप्ताह तक Trichogramma chilonis अंडे 50,000/हेक्टेयर/सप्ताह छोड़ें. प्रकोप 5% से अधिक हो तो सिंचाई पानी से क्लोरपायरीफॉस 20 EC 4 लीटर/हेक्टेयर ड्रेंच करें.$$, 'TNAU'),
  (35, 'Sugarcane', 'Pest Control', 'Annual', 'gu', $$અર્લી શૂટ બોરર નિયંત્રણ$$, $$શરૂઆતના પાકમાં ડેડ હાર્ટ જુઓ. એપ્રિલથી 8 અઠવાડિયા સુધી Trichogramma chilonis ઈંડા 50,000/હે./અઠવાડિયા છોડો. ઉપદ્રવ 5%થી વધુ હોય તો સિંચાઈ પાણીથી ક્લોરપાયરિફોસ 20 EC 4 લિટર/હે. ડ્રેંચ કરો.$$, 'TNAU'),

  (36, 'Sugarcane', 'Ratoon Management', 'Annual', 'en', $$Ratoon Crop Management$$, $$After harvest, cut stubble close to ground level with a sharp cut. Apply 25% extra nitrogen compared with the plant crop. Fill gaps with fresh setts within 15 days. Good ratoon care gives 80-85% of plant crop yield.$$, 'ICAR-IISR'),
  (36, 'Sugarcane', 'Ratoon Management', 'Annual', 'hi', $$रैटून फसल प्रबंधन$$, $$कटाई के बाद ठूंठ को जमीन के पास तेज कट से काटें. प्लांट क्रॉप की तुलना में 25% अधिक नाइट्रोजन दें. 15 दिन में खाली जगह नए सेट से भरें. अच्छी रैटून देखभाल से प्लांट क्रॉप की 80-85% उपज मिलती है.$$, 'ICAR-IISR'),
  (36, 'Sugarcane', 'Ratoon Management', 'Annual', 'gu', $$રેટૂન પાક વ્યવસ્થાપન$$, $$કાપણી પછી ઠૂંઠાને જમીન નજીક તીખા કાપથી કાપો. પ્લાન્ટ ક્રોપ કરતાં 25% વધુ નાઇટ્રોજન આપો. 15 દિવસમાં ખાલી જગ્યા નવા સેટથી भरो. સારી રેટૂન કાળજીથી પ્લાન્ટ ક્રોપની 80-85% ઉપજ મળે છે.$$, 'ICAR-IISR'),

  (37, 'Sugarcane', 'Harvesting', 'Annual', 'en', $$Brix-Based Harvest Decision$$, $$Harvest when juice Brix reaches 18-20 degrees and purity is above 85%. Ideally harvest 12-14 months after planting. Harvest early morning to reduce sugar loss and process within 24 hours.$$, 'ICAR-IISR'),
  (37, 'Sugarcane', 'Harvesting', 'Annual', 'hi', $$ब्रिक्स आधारित कटाई निर्णय$$, $$जब रस ब्रिक्स 18-20 डिग्री और शुद्धता 85% से अधिक हो तब कटाई करें. सामान्यतः रोपण के 12-14 महीने बाद कटाई सही है. चीनी नुकसान घटाने के लिए सुबह कटाई करें और 24 घंटे में प्रसंस्करण करें.$$, 'ICAR-IISR'),
  (37, 'Sugarcane', 'Harvesting', 'Annual', 'gu', $$બ્રિક્સ આધારીત કાપણી નિર્ણય$$, $$રસ બ્રિક્સ 18-20 ડિગ્રી અને શુદ્ધતા 85%થી વધુ હોય ત્યારે કાપણી કરો. સામાન્ય રીતે વાવણી પછી 12-14 મહિને કાપણી યોગ્ય છે. ખાંડનું નુકસાન ઘટાડવા સવારે કાપણી કરો અને 24 કલાકમાં પ્રોસેસ કરો.$$, 'ICAR-IISR'),

  (38, 'Vegetables', 'Soil Preparation', 'All Season', 'en', $$Raised Bed Preparation$$, $$Prepare raised beds 1.0-1.2 m wide, 20-25 cm high, and of convenient length. Raised beds improve drainage, support earlier planting, and improve aeration. Mix 5-8 kg compost per square metre into the top 20 cm soil.$$, 'IIVR'),
  (38, 'Vegetables', 'Soil Preparation', 'All Season', 'hi', $$ऊंची क्यारी तैयारी$$, $$1.0-1.2 मीटर चौड़ी, 20-25 सेमी ऊंची और सुविधाजनक लंबाई की ऊंची क्यारियां बनाएं. इससे जल निकास, जल्दी रोपाई और वायुसंचार सुधरता है. ऊपर की 20 सेमी मिट्टी में 5-8 किलो/वर्ग मीटर कम्पोस्ट मिलाएं.$$, 'IIVR'),
  (38, 'Vegetables', 'Soil Preparation', 'All Season', 'gu', $$ઊંચી ક્યારી તૈયારી$$, $$1.0-1.2 મીટર પહોળી, 20-25 સેમી ઊંચી અને અનુકૂળ લંબાઈની ઊંચી ક્યારીઓ બનાવો. તે નિકાસ, વહેલી રોપણી અને હવાની અવરજવર સુધારે છે. ઉપરની 20 સેમી માટીમાં 5-8 કિગ્રા/વર્ગ મીટર કમ્પોસ્ટ ભેળવો.$$, 'IIVR'),

  (39, 'Vegetables', 'Seed & Sowing', 'All Season', 'en', $$Nursery Tray Sowing for Transplanted Crops$$, $$Use pro-trays with cocopeat, vermiculite, and perlite in 3:1:1 ratio for nursery raising. Maintain 25-28 C and 80% humidity. Harden seedlings 7 days before transplanting by reducing irrigation and exposing them outdoors.$$, 'IIVR'),
  (39, 'Vegetables', 'Seed & Sowing', 'All Season', 'hi', $$रोपाई फसलों के लिए नर्सरी ट्रे$$, $$नर्सरी के लिए कोकोपीट, वर्मीकुलाइट और परलाइट 3:1:1 अनुपात वाले प्रो-ट्रे इस्तेमाल करें. 25-28 C तापमान और 80% नमी रखें. रोपाई से 7 दिन पहले सिंचाई घटाकर और बाहर रखकर पौधों को हार्डन करें.$$, 'IIVR'),
  (39, 'Vegetables', 'Seed & Sowing', 'All Season', 'gu', $$રોપણી પાક માટે નર્સરી ટ્રે$$, $$નર્સરી માટે કોખોપીટ, વર્મીક્યુલાઇટ અને પર્લાઇટ 3:1:1 પ્રમાણવાળી પ્રો-ટ્રે વાપરો. 25-28 C તાપમાન અને 80% ભેજ રાખો. રોપણીથી 7 દિવસ પહેલાં સિંચાઈ ઘટાડીને અને બહાર રાખીને રોપાને હાર્ડન કરો.$$, 'IIVR'),

  (40, 'Vegetables', 'Fertilizer', 'All Season', 'en', $$Fertigation Through Drip for Vegetables$$, $$Apply 75% of recommended NPK through drip fertigation in 20-25 splits over the crop duration. Use water-soluble fertilizers such as 19:19:19 in vegetative stage, 12:61:0 at flowering, and 0:0:50 at fruiting.$$, 'IIVR'),
  (40, 'Vegetables', 'Fertilizer', 'All Season', 'hi', $$सब्जियों में ड्रिप फर्टिगेशन$$, $$अनुशंसित NPK का 75% ड्रिप फर्टिगेशन से 20-25 किस्तों में दें. जल-घुलनशील खाद जैसे वनस्पति अवस्था में 19:19:19, फूल पर 12:61:0 और फल अवस्था में 0:0:50 इस्तेमाल करें.$$, 'IIVR'),
  (40, 'Vegetables', 'Fertilizer', 'All Season', 'gu', $$શાકભાજીમાં ડ્રિપ ફર્ટિગેશન$$, $$ભલામણ કરેલ NPKનું 75% ડ્રિપ ફર્ટિગેશનથી પાક અવધિ દરમિયાન 20-25 હપ્તામાં આપો. પાણીમાં દ્રાવ્ય ખાતર જેમ કે વનસ્પતિ અવસ્થામાં 19:19:19, ફૂલ સમયે 12:61:0 અને ફળ સમયે 0:0:50 વાપરો.$$, 'IIVR'),

  (41, 'Vegetables', 'Water Management', 'All Season', 'en', $$Mulching to Conserve Moisture$$, $$Apply black plastic mulch of 25-30 micron or 5 cm thick paddy straw mulch on beds. Mulching can reduce irrigation frequency by 40%, suppress 90% weeds, and keep soil temperature uniform.$$, 'IARI'),
  (41, 'Vegetables', 'Water Management', 'All Season', 'hi', $$नमी बचाने के लिए मल्चिंग$$, $$क्यारियों पर 25-30 माइक्रोन काली प्लास्टिक मल्च या 5 सेमी मोटी धान पुआल मल्च लगाएं. मल्चिंग से सिंचाई आवृत्ति 40% घट सकती है, 90% खरपतवार दबते हैं और मिट्टी तापमान समान रहता है.$$, 'IARI'),
  (41, 'Vegetables', 'Water Management', 'All Season', 'gu', $$ભેજ બચાવવા મલ્ચિંગ$$, $$ક્યારીઓ પર 25-30 માઇક્રોન કાળી પ્લાસ્ટિક મલ્ચ અથવા 5 સેમી જાડી ડાંગરની પાળ મલ્ચ લગાવો. મલ્ચિંગથી સિંચાઈ આવર્તન 40% ઘટે, 90% નીંદણ દબાય અને માટીનું તાપમાન સમાન રહે.$$, 'IARI'),

  (42, 'Vegetables', 'Pest Control', 'All Season', 'en', $$Fruit and Shoot Borer in Brinjal and Tomato$$, $$Install 10 pheromone traps per acre. Remove and destroy affected shoots weekly. Spray Spinosad 45 SC at 125 ml/ha at 10-day intervals only when ETL is crossed; avoid calendar sprays.$$, 'TNAU'),
  (42, 'Vegetables', 'Pest Control', 'All Season', 'hi', $$बैंगन और टमाटर में फल-तना छेदक$$, $$प्रति एकड़ 10 फेरोमोन ट्रैप लगाएं. प्रभावित टहनियां हर सप्ताह हटाकर नष्ट करें. ETL पार होने पर ही 10 दिन के अंतर से स्पिनोसैड 45 SC 125 मिली/हेक्टेयर छिड़कें; कैलेंडर छिड़काव न करें.$$, 'TNAU'),
  (42, 'Vegetables', 'Pest Control', 'All Season', 'gu', $$રીંગણ અને ટામેટામાં ફળ-ટોચ છિદ્રક$$, $$પ્રતિ એકર 10 ફેરોમોન ટ્રેપ લગાવો. અસરગ્રસ્ત ડાળીઓ દર અઠવાડિયે દૂર કરી નષ્ટ કરો. ETL વટાવે ત્યારે જ 10 દિવસ અંતરે સ્પિનોસેડ 45 SC 125 મિલી/હે. છાંટો; કેલેન્ડર છંટકાવ ન કરો.$$, 'TNAU'),

  (43, 'Vegetables', 'Disease Management', 'All Season', 'en', $$Downy Mildew and Powdery Mildew Control$$, $$For downy mildew, spray Metalaxyl plus Mancozeb 72 WP at 2.5 g/litre. For powdery mildew, spray Sulphur 80 WP at 3 g/litre or Dinocap 1 ml/litre. Spray in the evening for better efficacy.$$, 'IIVR'),
  (43, 'Vegetables', 'Disease Management', 'All Season', 'hi', $$डाउनy और पाउडरी मिल्ड्यू नियंत्रण$$, $$डाउनy मिल्ड्यू के लिए मेटालेक्सिल + मैंकोजेब 72 WP 2.5 ग्राम/लीटर छिड़कें. पाउडरी मिल्ड्यू के लिए सल्फर 80 WP 3 ग्राम/लीटर या डाइनोकैप 1 मिली/लीटर छिड़कें. बेहतर असर के लिए शाम को छिड़कें.$$, 'IIVR'),
  (43, 'Vegetables', 'Disease Management', 'All Season', 'gu', $$ડાઉની અને પાવડરી મિલ્ડ્યુ નિયંત્રણ$$, $$ડાઉની મિલ્ડ્યુ માટે મેટાલેક્સિલ + મેન્કોઝેબ 72 WP 2.5 ગ્રામ/લિટર છાંટો. પાવડરી મિલ્ડ્યુ માટે સલ્ફર 80 WP 3 ગ્રામ/લિટર અથવા ડાઇનોકેપ 1 મિલી/લિટર છાંટો. વધુ અસર માટે સાંજે છાંટો.$$, 'IIVR'),

  (44, 'Vegetables', 'Harvesting', 'All Season', 'en', $$Correct Maturity Index for Vegetables$$, $$Harvest leafy vegetables before bolting, around 45-60 DAS. Harvest tomato at breaker stage for distant markets or fully red for local markets. Pick cucurbits while tender. Harvest in the morning and pre-cool before transport.$$, 'IIVR'),
  (44, 'Vegetables', 'Harvesting', 'All Season', 'hi', $$सब्जियों का सही परिपक्वता सूचक$$, $$पत्तेदार सब्जियां बोल्टिंग से पहले, लगभग 45-60 DAS पर काटें. दूर बाजार के लिए टमाटर ब्रेकर अवस्था पर और स्थानीय बाजार के लिए पूर्ण लाल काटें. कुकुर्बिट नरम अवस्था में तोड़ें. सुबह कटाई करें और परिवहन से पहले प्री-कूल करें.$$, 'IIVR'),
  (44, 'Vegetables', 'Harvesting', 'All Season', 'gu', $$શાકભાજીનો યોગ્ય પાકાવ સૂચક$$, $$પાંદડાવાળી શાકભાજી બોલ્ટિંગ પહેલાં, આશરે 45-60 DAS પર કાપો. દૂર બજાર માટે ટામેટાં બ્રેકર અવસ્થાએ અને સ્થાનિક બજાર માટે પૂર્ણ લાલ કાપો. કુકર્બિટ નરમ હોય ત્યારે તોડો. સવારે કાપણી કરો અને પરિવહન પહેલાં પ્રી-કૂલ કરો.$$, 'IIVR'),

  (45, 'Vegetables', 'Post-Harvest', 'All Season', 'en', $$Pre-Cooling and Grading for Better Price$$, $$Pre-cool vegetables to 10-15 C within 2 hours of harvest. Grade by size and colour. Use perforated CFB boxes for packing. Pre-cooled vegetables have 2-3 times longer shelf life than uncooled produce.$$, 'NIFTEM'),
  (45, 'Vegetables', 'Post-Harvest', 'All Season', 'hi', $$बेहतर भाव के लिए प्री-कूलिंग और ग्रेडिंग$$, $$कटाई के 2 घंटे के भीतर सब्जियों को 10-15 C तक प्री-कूल करें. आकार और रंग के आधार पर ग्रेडिंग करें. पैकिंग के लिए छिद्रित CFB बॉक्स इस्तेमाल करें. प्री-कूल सब्जियों की शेल्फ लाइफ 2-3 गुना अधिक होती है.$$, 'NIFTEM'),
  (45, 'Vegetables', 'Post-Harvest', 'All Season', 'gu', $$વધુ ભાવ માટે પ્રી-કૂલિંગ અને ગ્રેડિંગ$$, $$કાપણીના 2 કલાકમાં શાકભાજીને 10-15 C સુધી પ્રી-કૂલ કરો. કદ અને રંગ પ્રમાણે ગ્રેડિંગ કરો. પેકિંગ માટે છિદ્રવાળા CFB બોક્સ વાપરો. પ્રી-કૂલ શાકભાજીનું શેલ્ફ લાઈફ 2-3 ગણું વધુ હોય છે.$$, 'NIFTEM'),

  (46, 'Other', 'Soil Health', 'All Season', 'en', $$Soil Testing Before Every Season$$, $$Test soil every 2-3 years at the nearest soil testing lab. Check pH, NPK, micronutrients, and organic carbon. Fertilization based on soil test can reduce input cost by 20-30% and prevent nutrient toxicity.$$, 'ICAR'),
  (46, 'Other', 'Soil Health', 'All Season', 'hi', $$हर मौसम से पहले मिट्टी जांच$$, $$नजदीकी मिट्टी परीक्षण प्रयोगशाला में हर 2-3 वर्ष मिट्टी जांच कराएं. pH, NPK, सूक्ष्म पोषक और जैविक कार्बन जांचें. मिट्टी रिपोर्ट आधारित खाद 20-30% लागत घटा सकती है और पोषक विषाक्तता रोकती है.$$, 'ICAR'),
  (46, 'Other', 'Soil Health', 'All Season', 'gu', $$દર સીઝન પહેલાં માટી પરીક્ષણ$$, $$નજીકની માટી પરીક્ષણ લેબમાં દર 2-3 વર્ષે માટી તપાસ કરાવો. pH, NPK, સૂક્ષ્મ પોષક અને સજીવ કાર્બન તપાસો. માટી રિપોર્ટ મુજબ ખાતર આપવાથી 20-30% ખર્ચ ઘટે અને પોષક ઝેરી અસર અટકે છે.$$, 'ICAR'),

  (47, 'Other', 'Organic Farming', 'All Season', 'en', $$Compost and Vermicompost Application$$, $$Apply 5-10 tonnes FYM/ha or 2.5-3 tonnes vermicompost/ha before sowing. Vermicompost improves soil structure and water-holding capacity, provides slow-release nutrients, and helps suppress some soil-borne diseases.$$, 'ICAR'),
  (47, 'Other', 'Organic Farming', 'All Season', 'hi', $$कम्पोस्ट और वर्मी कम्पोस्ट प्रयोग$$, $$बुवाई से पहले 5-10 टन FYM/हेक्टेयर या 2.5-3 टन वर्मी कम्पोस्ट/हेक्टेयर दें. वर्मी कम्पोस्ट मिट्टी संरचना, पानी धारण क्षमता और धीमे पोषण को सुधारता है तथा कुछ मिट्टी जनित रोग घटाता है.$$, 'ICAR'),
  (47, 'Other', 'Organic Farming', 'All Season', 'gu', $$કમ્પોસ્ટ અને વર્મી કમ્પોસ્ટ આપવું$$, $$વાવણી પહેલાં 5-10 ટન FYM/હે. અથવા 2.5-3 ટન વર્મી કમ્પોસ્ટ/હે. આપો. વર્મી કમ્પોસ્ટ માટીની રચના, પાણી ધારણ ક્ષમતા અને ધીમું પોષણ સુધારે છે તથા કેટલાક જમીનજન્ય રોગ ઘટાડે છે.$$, 'ICAR'),

  (48, 'Other', 'Water Conservation', 'All Season', 'en', $$Rainwater Harvesting for Irrigation$$, $$Construct a farm pond, for example 30 x 30 x 3 m, to collect monsoon runoff. A 1-ha catchment can store 200-300 cubic metres of water, enough for one life-saving irrigation on 1 acre during drought. Line the pond to reduce seepage.$$, 'IARI'),
  (48, 'Other', 'Water Conservation', 'All Season', 'hi', $$सिंचाई के लिए वर्षा जल संचयन$$, $$मानसून रनऑफ इकट्ठा करने के लिए 30 x 30 x 3 मीटर जैसा खेत तालाब बनाएं. 1 हेक्टेयर कैचमेंट 200-300 घन मीटर पानी जमा कर सकता है, जो सूखे में 1 एकड़ को एक जीवन रक्षक सिंचाई के लिए पर्याप्त है. रिसाव घटाने के लिए लाइनिंग करें.$$, 'IARI'),
  (48, 'Other', 'Water Conservation', 'All Season', 'gu', $$સિંચાઈ માટે વરસાદી પાણી સંગ્રહ$$, $$મોન્સૂન રનઓફ એકત્ર કરવા 30 x 30 x 3 મીટર જેવા ખેત તળાવ બનાવો. 1 હે. કેચમેન્ટ 200-300 ઘન મીટર પાણી સંગ્રહ કરી શકે છે, જે સુકામાં 1 એકર માટે એક જીવનરક્ષક સિંચાઈ પૂરતું છે. ઝરવું ઘટાડવા લાઇનિંગ કરો.$$, 'IARI'),

  (49, 'Other', 'Climate Advisory', 'All Season', 'en', $$Using Agromet Advisories$$, $$Subscribe to district-level IMD-ICAR Agromet advisories issued every Tuesday and Friday. These 5-day forecasts include crop-specific recommendations. Access them through the mKisan portal or Meghdoot app.$$, 'IMD-ICAR'),
  (49, 'Other', 'Climate Advisory', 'All Season', 'hi', $$एग्रोमेट सलाह का उपयोग$$, $$हर मंगलवार और शुक्रवार जारी जिला स्तरीय IMD-ICAR एग्रोमेट सलाह लें. इनमें 5-दिन मौसम पूर्वानुमान और फसल-विशेष सुझाव होते हैं. mKisan पोर्टल या Meghdoot ऐप से देखें.$$, 'IMD-ICAR'),
  (49, 'Other', 'Climate Advisory', 'All Season', 'gu', $$એગ્રોમેટ સલાહનો ઉપયોગ$$, $$દર મંગળવાર અને શુક્રવારે જાહેર થતી જિલ્લા સ્તરની IMD-ICAR એગ્રોમેટ સલાહ લો. તેમાં 5 દિવસ હવામાન આગાહી અને પાક વિશેષ ભલામણો હોય છે. mKisan પોર્ટલ અથવા Meghdoot એપથી જુઓ.$$, 'IMD-ICAR'),

  (50, 'Other', 'Finance & Schemes', 'All Season', 'en', $$PM-KISAN and Crop Insurance Enrollment$$, $$Enroll in PM-KISAN for Rs 6,000 per year income support. Register under PMFBY crop insurance before the seasonal cutoff date: July 31 for Kharif and December 31 for Rabi. Apply at the nearest CSC or bank.$$, 'MoAFW'),
  (50, 'Other', 'Finance & Schemes', 'All Season', 'hi', $$PM-KISAN और फसल बीमा पंजीकरण$$, $$PM-KISAN में 6,000 रुपये/वर्ष आय सहायता के लिए नामांकन करें. PMFBY फसल बीमा में मौसम की अंतिम तारीख से पहले पंजीकरण करें: खरीफ 31 जुलाई और रबी 31 दिसंबर. नजदीकी CSC या बैंक में आवेदन करें.$$, 'MoAFW'),
  (50, 'Other', 'Finance & Schemes', 'All Season', 'gu', $$PM-KISAN અને પાક વીમા નોંધણી$$, $$PM-KISANમાં રૂ. 6,000/વર્ષ આવક સહાય માટે નોંધણી કરો. PMFBY પાક વીમામાં સીઝનની છેલ્લી તારીખ પહેલાં નોંધણી કરો: ખરીફ 31 જુલાઈ અને રબી 31 ડિસેમ્બર. નજીકના CSC અથવા બેંકમાં અરજી કરો.$$, 'MoAFW')
)
INSERT INTO public.farming_tips (
  dataset_id,
  crop_type,
  category,
  season,
  language,
  title,
  description,
  content,
  source,
  is_active
)
SELECT
  dataset_id,
  crop_type,
  category,
  season,
  language,
  title,
  description,
  description,
  source,
  true
FROM seed
ON CONFLICT (dataset_id, language)
DO UPDATE SET
  crop_type = EXCLUDED.crop_type,
  category = EXCLUDED.category,
  season = EXCLUDED.season,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  source = EXCLUDED.source,
  is_active = true,
  updated_at = now();
