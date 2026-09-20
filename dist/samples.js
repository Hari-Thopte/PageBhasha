// Original educational sample content; never substituted for a user's upload.
export const source = 'Photosynthesis is the process by which green plants make food using sunlight. Chlorophyll, the green pigment in leaves, absorbs light energy. Plants take in carbon dioxide through tiny openings in leaves called stomata. Roots absorb water from the soil. Using light energy, plants convert carbon dioxide and water into glucose, a sugar that stores energy. Oxygen is released as a by-product. Sunlight is the energy source, not a material ingredient. Plants also carry out respiration, using glucose to release energy for their activities.';
const evidence = [
  {quote:'Chlorophyll, the green pigment in leaves, absorbs light energy.', explanation:''},
  {quote:'Using light energy, plants convert carbon dioxide and water into glucose, a sugar that stores energy.', explanation:''},
  {quote:'Plants also carry out respiration, using glucose to release energy for their activities.', explanation:''}
];
export const samples = {
 English: {
  title:'How plants make their own food',
  summary:'A leaf is a little food-making workshop. It uses energy from sunlight to turn water and carbon dioxide into glucose. This process is called photosynthesis.',
  explanation:[
   'First, collect the ingredients. Roots absorb water from the soil. Carbon dioxide enters leaves through tiny openings called stomata.',
   'Next, capture the energy. Chlorophyll, the green pigment in leaves, absorbs sunlight. Light supplies energy; it is not a material ingredient.',
   'Now, make food. Using light energy, the plant converts water and carbon dioxide into glucose, a sugar that stores energy. Oxygen is released as a by-product.',
   'Think of a kitchen as an analogy: water and carbon dioxide are ingredients; sunlight is the power. The leaf makes glucose rather than a cooked meal.',
   'Plants still need respiration. Photosynthesis stores energy in glucose; respiration releases usable energy from glucose for the plant’s activities.'
  ],
  takeaways:['Inputs: water and carbon dioxide. Energy source: sunlight.','Outputs: glucose and oxygen.','Photosynthesis makes food; respiration releases energy from that food.'],
  glossary:[{quote:'Photosynthesis',explanation:'Making food using light energy.'},{quote:'Chlorophyll',explanation:'The green pigment that absorbs light.'},{quote:'Stomata',explanation:'Tiny openings in leaves for gas exchange.'},{quote:'Glucose',explanation:'A sugar that stores chemical energy.'}],
  evidence:evidence.map((x,i)=>({...x,explanation:['This identifies the role of the green pigment.','This gives the materials used and the food produced.','This explains why making food does not replace respiration.'][i]})),
  quiz:[{question:'Which pair provides the material ingredients for photosynthesis?',options:['Water and carbon dioxide','Sunlight and oxygen','Glucose and water','Oxygen and glucose'],answer:0,explanation:'Water and carbon dioxide supply the material; sunlight supplies energy.'},{question:'What does chlorophyll do?',options:['Absorbs water from soil','Absorbs light energy','Stores oxygen in roots','Breaks down rocks'],answer:1,explanation:'Chlorophyll is the pigment in leaves that absorbs light energy.'},{question:'Why do plants also need respiration?',options:['To create sunlight','To stop making glucose','To release energy from glucose','To remove all chlorophyll'],answer:2,explanation:'Respiration releases energy stored in glucose for the plant’s activities.'}],
  followups:['Is sunlight an ingredient?','Why do plants need respiration?','Explain it with an everyday example.'],
  answers:['Sunlight provides energy. The material ingredients are water and carbon dioxide. Think of electricity powering a kitchen: it helps cooking happen, but is not part of the ingredients.','Making food and using its energy are different tasks. Photosynthesis stores energy in glucose. Respiration releases energy from glucose so the plant can carry out its activities.','Imagine a kitchen. Water and carbon dioxide are the ingredients, and sunlight is the power. The leaf uses that energy to make glucose. This is only an analogy; leaves do not literally cook food.']
 },
 Hindi: {
  title:'पौधे अपना खाना कैसे बनाते हैं?',
  summary:'हर पत्ती को एक छोटी-सी रसोई समझो। वह सूरज की रोशनी की ऊर्जा से पानी और कार्बन डाइऑक्साइड को ग्लूकोज़ में बदलती है। इस प्रक्रिया को प्रकाश संश्लेषण कहते हैं।',
  explanation:[
   'पहले सामग्री इकट्ठा होती है। जड़ें मिट्टी से पानी लेती हैं। पत्तियों के छोटे-छोटे छिद्रों, जिन्हें रंध्र कहते हैं, से कार्बन डाइऑक्साइड अंदर आती है।',
   'फिर ऊर्जा मिलती है। पत्तियों का हरा वर्णक, क्लोरोफिल, सूरज की रोशनी को अवशोषित करता है। रोशनी ऊर्जा का स्रोत है, खाना बनाने की भौतिक सामग्री नहीं।',
   'अब खाना बनता है। प्रकाश की ऊर्जा से पानी और कार्बन डाइऑक्साइड ग्लूकोज़ नाम की शर्करा में बदलते हैं। इसमें ऊर्जा संचित रहती है। ऑक्सीजन उप-उत्पाद के रूप में निकलती है।',
   'रसोई का उदाहरण लो: पानी और कार्बन डाइऑक्साइड सामग्री हैं, और सूरज की रोशनी रसोई चलाने की ऊर्जा जैसी है। यह केवल तुलना है; पत्तियाँ सचमुच खाना नहीं पकातीं।',
   'पौधे श्वसन भी करते हैं। प्रकाश संश्लेषण ग्लूकोज़ में ऊर्जा संचित करता है। श्वसन उस ऊर्जा को पौधे की गतिविधियों के लिए उपलब्ध कराता है।'
  ],
  takeaways:['सामग्री: पानी और कार्बन डाइऑक्साइड। ऊर्जा: सूरज की रोशनी।','उत्पाद: ग्लूकोज़ और ऑक्सीजन।','प्रकाश संश्लेषण खाना बनाता है; श्वसन उससे ऊर्जा प्राप्त करता है।'],
  glossary:[{quote:'प्रकाश संश्लेषण',explanation:'प्रकाश की ऊर्जा से भोजन बनाना।'},{quote:'क्लोरोफिल',explanation:'प्रकाश सोखने वाला हरा वर्णक।'},{quote:'रंध्र',explanation:'पत्तियों में गैसों के आदान-प्रदान के छोटे छिद्र।'},{quote:'ग्लूकोज़',explanation:'ऊर्जा संचित करने वाली शर्करा।'}],
  evidence:evidence.map((x,i)=>({...x,explanation:['यह वाक्य हरे वर्णक का काम बताता है।','यह सामग्री और बनने वाले भोजन को स्पष्ट करता है।','भोजन बनाना और उसकी ऊर्जा का उपयोग करना अलग प्रक्रियाएँ हैं।'][i]})),
  quiz:[{question:'प्रकाश संश्लेषण की भौतिक सामग्री कौन-सी है?',options:['पानी और कार्बन डाइऑक्साइड','धूप और ऑक्सीजन','ग्लूकोज़ और पानी','ऑक्सीजन और ग्लूकोज़'],answer:0,explanation:'पानी और कार्बन डाइऑक्साइड सामग्री हैं। धूप ऊर्जा देती है।'},{question:'क्लोरोफिल का काम क्या है?',options:['मिट्टी से पानी लेना','प्रकाश की ऊर्जा सोखना','जड़ों में ऑक्सीजन जमा करना','पत्थर तोड़ना'],answer:1,explanation:'क्लोरोफिल पत्तियों में मौजूद हरा वर्णक है, जो प्रकाश की ऊर्जा सोखता है।'},{question:'पौधों को श्वसन की आवश्यकता क्यों है?',options:['धूप बनाने के लिए','ग्लूकोज़ बनाना रोकने के लिए','ग्लूकोज़ से ऊर्जा प्राप्त करने के लिए','क्लोरोफिल हटाने के लिए'],answer:2,explanation:'श्वसन ग्लूकोज़ में संचित ऊर्जा को पौधे की गतिविधियों के लिए उपलब्ध कराता है।'}],
  followups:['क्या धूप भी एक सामग्री है?','पौधे श्वसन क्यों करते हैं?','रोज़मर्रा का एक उदाहरण दो।'],
  answers:['धूप ऊर्जा देती है। असली सामग्री पानी और कार्बन डाइऑक्साइड हैं। जैसे बिजली रसोई के उपकरण को चलाती है, लेकिन खाने की सामग्री नहीं होती, वैसे ही धूप प्रकाश संश्लेषण के लिए ऊर्जा देती है।','खाना बनाना और उसकी ऊर्जा इस्तेमाल करना अलग काम हैं। प्रकाश संश्लेषण ग्लूकोज़ में ऊर्जा संचित करता है। श्वसन उस ऊर्जा को पौधे की गतिविधियों के लिए उपलब्ध कराता है।','एक रसोई की कल्पना करो। पानी और कार्बन डाइऑक्साइड सामग्री हैं। धूप रसोई चलाने की ऊर्जा है। पत्ती इस ऊर्जा से ग्लूकोज़ बनाती है। यह सिर्फ तुलना है; पत्ती सचमुच खाना नहीं पकाती।']
 },
 Tamil: {
  title:'தாவரங்கள் உணவை எப்படித் தயாரிக்கின்றன?',
  summary:'ஒவ்வோர் இலையையும் ஒரு சிறிய சமையலறையாக நினைத்துக்கொள். சூரிய ஒளியின் ஆற்றலைப் பயன்படுத்தி நீரையும் கார்பன் டைஆக்சைடையும் குளுக்கோஸாக மாற்றுகிறது. இதுவே ஒளிச்சேர்க்கை.',
  explanation:[
   'முதலில் தேவையான பொருட்கள் கிடைக்கின்றன. வேர்கள் மண்ணிலிருந்து நீரை உறிஞ்சுகின்றன. இலைகளில் உள்ள சிறிய இலைத்துளைகள் வழியாக கார்பன் டைஆக்சைடு உள்ளே செல்கிறது.',
   'அடுத்து ஆற்றல் கிடைக்கிறது. இலைகளில் உள்ள பச்சை நிறமியான பச்சையம் சூரிய ஒளியை உறிஞ்சுகிறது. ஒளி ஆற்றலை வழங்குகிறது; அது உணவு தயாரிக்கும் மூலப்பொருள் அல்ல.',
   'ஒளி ஆற்றலைப் பயன்படுத்தி நீரும் கார்பன் டைஆக்சைடும் குளுக்கோஸ் என்ற சர்க்கரையாக மாற்றப்படுகின்றன. அதில் ஆற்றல் சேமிக்கப்படுகிறது. ஆக்சிஜன் துணை விளைபொருளாக வெளியேறுகிறது.',
   'சமையலறையை எடுத்துக்காட்டாக நினைத்துக்கொள். நீரும் கார்பன் டைஆக்சைடும் பொருட்கள்; சூரிய ஒளி சமையலுக்கான ஆற்றல் போன்றது. இது ஓர் ஒப்புமை மட்டுமே; இலைகள் உண்மையில் சமைப்பதில்லை.',
   'தாவரங்களும் சுவாசிக்கின்றன. ஒளிச்சேர்க்கை குளுக்கோஸில் ஆற்றலைச் சேமிக்கிறது. சுவாசம் அந்த ஆற்றலைத் தாவரத்தின் செயல்களுக்கு விடுவிக்கிறது.'
  ],
  takeaways:['மூலப்பொருட்கள்: நீர், கார்பன் டைஆக்சைடு. ஆற்றல்: சூரிய ஒளி.','விளைபொருட்கள்: குளுக்கோஸ், ஆக்சிஜன்.','ஒளிச்சேர்க்கை உணவை உருவாக்குகிறது; சுவாசம் அதிலிருந்து ஆற்றலை விடுவிக்கிறது.'],
  glossary:[{quote:'ஒளிச்சேர்க்கை',explanation:'ஒளி ஆற்றலைப் பயன்படுத்தி உணவு தயாரித்தல்.'},{quote:'பச்சையம்',explanation:'ஒளியை உறிஞ்சும் பச்சை நிறமி.'},{quote:'இலைத்துளைகள்',explanation:'வாயுப் பரிமாற்றத்திற்கான சிறிய துளைகள்.'},{quote:'குளுக்கோஸ்',explanation:'ஆற்றலைச் சேமிக்கும் சர்க்கரை.'}],
  evidence:evidence.map((x,i)=>({...x,explanation:['பச்சை நிறமியின் வேலையை இந்த வரி விளக்குகிறது.','பயன்படும் பொருட்களையும் உருவாகும் உணவையும் இந்த வரி கூறுகிறது.','உணவு தயாரிப்பதும் அதிலிருந்து ஆற்றல் பெறுவதும் வெவ்வேறு செயல்கள்.'][i]})),
  quiz:[{question:'ஒளிச்சேர்க்கைக்குத் தேவையான மூலப்பொருட்கள் எவை?',options:['நீர் மற்றும் கார்பன் டைஆக்சைடு','சூரிய ஒளி மற்றும் ஆக்சிஜன்','குளுக்கோஸ் மற்றும் நீர்','ஆக்சிஜன் மற்றும் குளுக்கோஸ்'],answer:0,explanation:'நீரும் கார்பன் டைஆக்சைடும் மூலப்பொருட்கள். சூரிய ஒளி ஆற்றலை வழங்குகிறது.'},{question:'பச்சையம் என்ன செய்கிறது?',options:['மண்ணிலிருந்து நீரை உறிஞ்சுகிறது','ஒளி ஆற்றலை உறிஞ்சுகிறது','வேர்களில் ஆக்சிஜனைச் சேமிக்கிறது','பாறைகளை உடைக்கிறது'],answer:1,explanation:'பச்சையம் என்பது ஒளி ஆற்றலை உறிஞ்சும் பச்சை நிறமி.'},{question:'தாவரங்களுக்குச் சுவாசம் ஏன் தேவை?',options:['சூரிய ஒளியை உருவாக்க','குளுக்கோஸ் உருவாவதை நிறுத்த','குளுக்கோஸிலிருந்து ஆற்றலைப் பெற','பச்சையத்தை நீக்க'],answer:2,explanation:'சுவாசம் குளுக்கோஸில் உள்ள ஆற்றலைத் தாவரத்தின் செயல்களுக்காக விடுவிக்கிறது.'}],
  followups:['சூரிய ஒளியும் ஒரு மூலப்பொருளா?','தாவரங்கள் ஏன் சுவாசிக்கின்றன?','அன்றாட வாழ்க்கை உதாரணம் கூறு.'],
  answers:['சூரிய ஒளி ஆற்றலை வழங்குகிறது. நீரும் கார்பன் டைஆக்சைடும் மூலப்பொருட்கள். மின்சாரம் சமையல் சாதனத்தை இயக்கினாலும் உணவின் மூலப்பொருளாக இருப்பதில்லை. அதுபோலவே ஒளியின் பங்கு ஆற்றல் வழங்குவதாகும்.','உணவைத் தயாரிப்பதும் அதன் ஆற்றலைப் பயன்படுத்துவதும் வெவ்வேறு வேலைகள். ஒளிச்சேர்க்கை குளுக்கோஸில் ஆற்றலைச் சேமிக்கிறது. சுவாசம் அந்த ஆற்றலைத் தாவரத்தின் செயல்களுக்காக விடுவிக்கிறது.','ஒரு சமையலறையை நினைத்துக்கொள். நீரும் கார்பன் டைஆக்சைடும் பொருட்கள்; சூரிய ஒளி ஆற்றல். இலை அதைப் பயன்படுத்திக் குளுக்கோஸ் தயாரிக்கிறது. இது ஓர் ஒப்புமை மட்டுமே; இலை உண்மையில் சமைப்பதில்லை.']
 }
};
export const terms = ['Photosynthesis','Chlorophyll','Stomata','Glucose'];
export const headings = {
 English:['The idea, step by step','Keep these in mind','Your word bridge','Back to the source'],
 Hindi:['आओ, एक-एक कदम समझें','ये बातें याद रखें','शब्दों का पुल','मूल पाठ से जुड़ें'],
 Tamil:['படிப்படியாகப் புரிந்துகொள்வோம்','நினைவில் கொள்ளுங்கள்','சொற்களின் பாலம்','மூல உரையுடன் இணைப்போம்']
};
