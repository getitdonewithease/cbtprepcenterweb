import { Language } from "./LanguageContext";

export interface Translations {
  nav: {
    features: string;
    howItWorks: string;
    reviews: string;
    signin: string;
    signup: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    startLearning: string;
  };
  features: {
    title: string;
    subtitle: string;
    aiTutor: { title: string; description: string };
    smartPath: { title: string; description: string };
    practiceTests: { title: string; description: string };
    tracking: { title: string; description: string };
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
  };
  reviews: { title: string; subtitle: string };
  cta: { title: string; subtitle: string; button: string };
  footer: {
    tagline: string;
    copyright: string;
    quickLinks: string;
    company: string;
    resources: string;
    legal: string;
    home: string;
    features: string;
    dashboard: string;
    privacy: string;
    terms: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    followUs: string;
  };
  faqs: {
    title: string;
    subtitle: string;
    questions: Array<{ question: string; answer: string }>;
  };
  pages: {
    privacy: {
      title: string;
      lastUpdated: string;
      intro: string;
      sections: Array<{ title: string; content: string }>;
    };
    terms: {
      title: string;
      lastUpdated: string;
      intro: string;
      sections: Array<{ title: string; content: string }>;
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      emailLabel: string;
      phone: string;
      phoneLabel: string;
      address: string;
      addressLabel: string;
      message: string;
    };
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      reviews: "Reviews",
      signin: "Sign In",
      signup: "Sign Up",
    },
    hero: {
      title: "Ace Your UTME Exams with Confidence",
      subtitle:
        "Prepare smarter with AI-driven insights, adaptive learning paths, and personalized tutoring.",
      cta: "START PRACTICING NOW",
      startLearning: "SIGN IN YOUR ACCOUNT",
    },
    features: {
      title: "Why Choose Fasiti?",
      subtitle: "Everything you need to ace your exams",
      aiTutor: {
        title: "AI Tutor",
        description:
          "Get instant explanations and personalized guidance from our AI-powered tutor.",
      },
      smartPath: {
        title: "Smart Learning Path",
        description:
          "Our algorithm learns your weaknesses and creates a customized study plan.",
      },
      practiceTests: {
        title: "Practice Tests",
        description:
          "Hundreds of past questions and mock tests to boost your confidence.",
      },
      tracking: {
        title: "Progress Tracking",
        description:
          "Monitor your improvement with detailed analytics and performance insights.",
      },
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to success",
      step1: {
        title: "Sign Up",
        description: "Create your account and choose your subjects.",
      },
      step2: {
        title: "Practice",
        description: "Take tests and get AI-powered explanations.",
      },
      step3: {
        title: "Master",
        description: "Track progress and achieve your goals.",
      },
    },
    reviews: {
      title: "What Our Users Say",
      subtitle:
        "Thousands of students have improved their UTME scores with Fasiti",
    },
    cta: {
      title: "Ready to Transform Your Results?",
      subtitle: "Join thousands of students already preparing smarter.",
      button: "Get Started Today",
    },
    footer: {
      tagline: "Empowering students for exam success",
      copyright: "© 2026 Fasiti. All rights reserved.",
      quickLinks: "Quick Links",
      company: "Company",
      resources: "Resources",
      legal: "Legal",
      home: "Home",
      features: "Features",
      dashboard: "Dashboard",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Us",
      email: "Email: support@fasiti.io",
      phone: "Phone: +234 (0) 123 456 7890",
      address: "Lagos, Nigeria",
      followUs: "Follow Us",
    },
    faqs: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about Fasiti",
      questions: [
        {
          question: "What is Fasiti?",
          answer: "Fasiti is an AI-powered UTME preparation platform.",
        },
        {
          question: "Is Fasiti free?",
          answer: "Fasiti offers both free and premium plans.",
        },
        {
          question: "How does the AI tutor work?",
          answer:
            "Our AI tutor analyzes your answers and provides personalized explanations.",
        },
        {
          question: "Can I use Fasiti on mobile?",
          answer:
            "Yes, Fasiti works seamlessly on mobile devices, tablets, and desktops.",
        },
        {
          question: "How often are tests updated?",
          answer:
            "We update our practice test library regularly with new questions.",
        },
        {
          question: "Do you provide customer support?",
          answer:
            "Yes, our support team is available 24/7 at support@fasiti.io",
        },
      ],
    },
    pages: {
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated: January 2026",
        intro: "At Fasiti, we are committed to protecting your privacy.",
        sections: [
          {
            title: "Information We Collect",
            content:
              "We collect information you provide directly when you create an account or contact us.",
          },
          {
            title: "How We Use Your Information",
            content:
              "We use your information to provide services and personalize your learning experience.",
          },
          {
            title: "Data Security",
            content:
              "We implement measures to protect your personal data against unauthorized access.",
          },
          {
            title: "Your Rights",
            content:
              "You have the right to access, correct, or delete your personal data.",
          },
          {
            title: "Contact Us",
            content:
              "If you have questions, please contact us at support@fasiti.io or call +234 (0) 123 456 7890.",
          },
        ],
      },
      terms: {
        title: "Terms of Service",
        lastUpdated: "Last updated: January 2026",
        intro:
          "By accessing and using Fasiti, you accept and agree to be bound by these terms.",
        sections: [
          {
            title: "License to Use",
            content:
              "Fasiti grants you a limited license to use our platform for personal educational purposes only.",
          },
          {
            title: "User Responsibilities",
            content:
              "You agree to use Fasiti only for lawful purposes and not to infringe on others' rights.",
          },
          {
            title: "Intellectual Property",
            content: "All content on Fasiti is protected by copyright laws.",
          },
          {
            title: "Disclaimer",
            content: "Fasiti is provided as-is without warranties of any kind.",
          },
          {
            title: "Limitation of Liability",
            content:
              "Fasiti shall not be liable for any indirect or consequential damages.",
          },
        ],
      },
      contact: {
        title: "Contact Us",
        subtitle: "Have questions? We would love to hear from you.",
        email: "support@fasiti.io",
        emailLabel: "Email",
        phone: "+234 (0) 123 456 7890",
        phoneLabel: "Phone",
        address: "Lagos, Nigeria",
        addressLabel: "Address",
        message:
          "Our team typically responds within 24 hours during business days.",
      },
    },
  },
  ha: {
    nav: {
      features: "Halaye",
      howItWorks: "Yadda Ya Aiki",
      reviews: "Nazari",
      signin: "Shiga",
      signup: "Ljira",
    },
    hero: {
      title: "Mallami UTME & Post-UTME da AI",
      subtitle:
        "Shirya tare da hankali mai AI, hanyoyin koyo da kyau, da turawa na jiya.",
      cta: "Fara Gwaji Kyauta",
      startLearning: "Fara Koyo",
    },
    features: {
      title: "Me Ya Sa Za Ka Zaɓi Fasiti?",
      subtitle: "Duk abin da kuke buƙata don sami nasara",
      aiTutor: {
        title: "Mallami AI",
        description: "Sami bayani na jiya da jagora daga mallamin da AI.",
      },
      smartPath: {
        title: "Hanyar Koyo ta Wayo",
        description:
          "Algoritmin din ya koya raununka kuma ya buɗe tunanin koyo na kanun.",
      },
      practiceTests: {
        title: "Gwajin Gwaja",
        description: "Darusunan da yawa da mock gwajin da suka gabata.",
      },
      tracking: {
        title: "Bincika Ci Gaba",
        description: "Lura da ci gaban ka da bayanai na aiki na zafin jiki.",
      },
    },
    howItWorks: {
      title: "Yadda Ya Aiki",
      subtitle: "Matakai uku mafifi ga nasara",
      step1: {
        title: "Ljira",
        description: "San aiki ka kuma zaɓi batutuwan kaanka.",
      },
      step2: {
        title: "Gwaja",
        description: "Dauki gwajin kuma sami bayani daga AI.",
      },
      step3: {
        title: "Mashin",
        description: "Lura da ci gaba kuma cika burin.",
      },
    },
    reviews: {
      title: "Me ga ce Masu Amfani Da Shiru",
      subtitle: "Dubu-dubu na daliba sun inganta sakonnin su tare da Fasiti",
    },
    cta: {
      title: "Ka sa yara don canja sauyi na sakonnaka?",
      subtitle: "Shiga da kwari-kwari masu shiriya tare da wayo.",
      button: "Fara Jiya",
    },
    footer: {
      tagline: "Ƙarfafa dalibai don nasara gwaji",
      copyright: "© 2026 Fasiti. Duk hakki an ajiye.",
      quickLinks: "Hanyoyin Sauri",
      company: "Kamfani",
      resources: "Albarkatun",
      legal: "Doka",
      home: "Gida",
      features: "Halaye",
      dashboard: "Dashboard",
      privacy: "Sirin Sirri",
      terms: "Sharuɗɗa na Aika",
      contact: "Tuntubo Minu",
      email: "Imel: support@fasiti.io",
      phone: "Waya: +234 (0) 123 456 7890",
      address: "Lagos, Najeriya",
      followUs: "Bi Minu",
    },
    faqs: {
      title: "Tambayoyi Da Aka Samarya",
      subtitle: "Nemo amsa ga tambayoyi na kowa game da Fasiti",
      questions: [
        {
          question: "Me ne Fasiti?",
          answer: "Fasiti ni dandalin shirya UTME da Post-UTME da AI.",
        },
      ],
    },
    pages: {
      privacy: {
        title: "Sirin Sirri",
        lastUpdated: "An sabwa jiya: Janairu 2026",
        intro: "A Fasiti, mun damje da kariyar sirin sirri.",
        sections: [],
      },
      terms: {
        title: "Sharuɗɗa na Aika",
        lastUpdated: "An sabwa jiya: Janairu 2026",
        intro: "Ta hadewa kuma amfani da Fasiti, ka karbi kuma ka yarda.",
        sections: [],
      },
      contact: {
        title: "Tuntubo Minu",
        subtitle: "Kana da tambayoyi? Za mu ji da kayansu.",
        email: "support@fasiti.io",
        emailLabel: "Imel",
        phone: "+234 (0) 123 456 7890",
        phoneLabel: "Waya",
        address: "Lagos, Najeriya",
        addressLabel: "Wurin Zama",
        message: "Jogin muninc akike da amsa a cikin sa 24 kasuwa.",
      },
    },
  },
  ig: {
    nav: {
      features: "Njirimara",
      howItWorks: "Otú O Si Arụ",
      reviews: "Edemede",
      signin: "Banye",
      signup: "Debanye",
    },
    hero: {
      title: "Mụ UTME & Post-UTME na anya AI",
      subtitle:
        "Jiri nwale site na ọmụmụ AI, ụzọ agụmakwụkwọ, na ihe ozizi nke onwe gị.",
      cta: "Malite Njirimara Ngwa",
      startLearning: "Malite Agụmakwụkwọ",
    },
    features: {
      title: "Gini Ka Mere I Ga Aho Fasiti?",
      subtitle: "Ihe niile ị chọrọ ka ọ gụzie ịlụ egwu",
      aiTutor: {
        title: "Onye Nkuzi AI",
        description: "Nweta ngwọta ozugbo pụọ site na onye nkuzi AI.",
      },
      smartPath: {
        title: "Ụzọ Agụmakwụkwọ Nwere Mmetụta",
        description: "Ngwọta mụ gị ná ihe ị naghị ahu anya.",
      },
      practiceTests: {
        title: "Nnwale Omume",
        description: "Ihe nnwale dị ọtụtụ na oke nnwale.",
      },
      tracking: {
        title: "Nyochaa Ido Gara Nke Ụzụ",
        description: "Lelee ka ị na-aga nke mma na data.",
      },
    },
    howItWorks: {
      title: "Otú O Si Arụ",
      subtitle: "Ụzọ atọ mfọrọ ka ọ gụzie",
      step1: {
        title: "Debanye",
        description: "Guzobe akaụntụ gị ma zoro mmekorita.",
      },
      step2: { title: "Nnwale", description: "Mesụ nnwale kuma nweta ijuju." },
      step3: { title: "Zụlite", description: "Lelee ido gara nke ụzụ." },
    },
    reviews: {
      title: "Kedu ka Ndị Ọrụ Anyị Si Ekwu",
      subtitle: "Ọtụtụ ụmụ akwụkwọ ewezuga ihe nnwale si na Fasiti",
    },
    cta: {
      title: "Ị sụrụ mụ nye aha iji gbanwee ihe?",
      subtitle: "Sonyere umen pụtara na-arụkọ ala nke mma.",
      button: "Malite Ugbu C",
    },
    footer: {
      tagline: "Ike nye ụmụ akwụkwọ maka ihe nnwale ga-aga nke mma",
      copyright: "© 2026 Fasiti. Ọ bụla ikike akwadoro.",
      quickLinks: "Njikọ Ozugbo",
      company: "Ụlọ Ọrụ",
      resources: "Ebe Ịchọrọ Mma",
      legal: "Iwu",
      home: "Ụlọ",
      features: "Njirimara",
      dashboard: "Dashboard",
      privacy: "Nzuzo Usoro",
      terms: "Ngalaba Ọrụ",
      contact: "Kpọtụ Anyị",
      email: "Imelụ: support@fasiti.io",
      phone: "Ekwentị: +234 (0) 123 456 7890",
      address: "Lagos, Naịjirịa",
      followUs: "Soo Anyị",
    },
    faqs: {
      title: "Ajụjụ ndị a Ajụjụ Mgbe niile",
      subtitle: "Chọta azịza na ajụjụ ndị na-eme mma gbasara Fasiti",
      questions: [
        {
          question: "Kedu ihe Fasiti bụ?",
          answer: "Fasiti bụ ihe ngwakọta UTME na Post-UTME nwere AI.",
        },
      ],
    },
    pages: {
      privacy: {
        title: "Nzuzo Nzuzo",
        lastUpdated: "Ememeluwo: Janaụ 2026",
        intro: "Na Fasiti, egwu anyị ịchekwa ihe nzuzo gị.",
        sections: [],
      },
      terms: {
        title: "Mgbakọ nke Ọrụ",
        lastUpdated: "Ememeluwo: Janaụ 2026",
        intro: "Site n'iji na iji Fasiti, ị nụ na imezu ihe ozugbo.",
        sections: [],
      },
      contact: {
        title: "Kpọtụ Anyị",
        subtitle: "Ịnwere ajụjụ? Anyị chọrọ ịnụ gị.",
        email: "support@fasiti.io",
        emailLabel: "Imel",
        phone: "+234 (0) 123 456 7890",
        phoneLabel: "Ekwentị",
        address: "Lagos, Naịjịrịa",
        addressLabel: "Adreesị",
        message: "Ndị inyeaka anyị na-azịghachi azịza n'ime 24 awa.",
      },
    },
  },
  yo: {
    nav: {
      features: "Awọn Ẹya",
      howItWorks: "Bawo ni O Ṣiṣẹ",
      reviews: "Awọn Ariwo",
      signin: "Wole",
      signup: "Forukosile",
    },
    hero: {
      title: "Kọ UTME & Post-UTME Pẹlu AI",
      subtitle:
        "Ayẹji pelu awọn oye AI, awọn ọna ikẹkọ, ati itusilẹ ti ara ẹni.",
      cta: "Bẹrẹ Idanwo Ọfẹ",
      startLearning: "Bẹrẹ Ikẹkọ",
    },
    features: {
      title: "Kini Idi Lati Yan Fasiti?",
      subtitle: "Ohun gbogbo ti o yẹ fun ọ lati tẹ awọn ijiroro",
      aiTutor: {
        title: "Olukọ AI",
        description: "Gba awọn iyalẹnu ni isẹjẹ ati itọsọna lati olukọ AI.",
      },
      smartPath: {
        title: "Ọna Ikẹkọ Ọ kunna",
        description: "Oniruuru wa kọ lori kẹkọ rẹ ati ṣe atẹle ikẹkọ.",
      },
      practiceTests: {
        title: "Awọn Idanwo Isonade",
        description: "Ọpọlọpọ awọn ibeere ati awọn idanwo.",
      },
      tracking: {
        title: "Ṣe Akiyesi Ìsipẹ",
        description: "Ṣe akiyesi iyipada rẹ pelu awọn alaye imọran.",
      },
    },
    howItWorks: {
      title: "Bawo ni O Ṣiṣẹ",
      subtitle: "Awọn igbesẹ mẹta ti o rọrun si aṣeyọri",
      step1: {
        title: "Forukosile",
        description: "Ṣẹda akaụnti rẹ ki o yan awọn pakọ rẹ.",
      },
      step2: {
        title: "Isonade",
        description: "Gba awọn idanwo ati gba awọn iyalẹnu.",
      },
      step3: {
        title: "Ṣakosile",
        description: "Ṣe akiyesi iyipada ati naa awọn ibi.",
      },
    },
    reviews: {
      title: "Kini Awọn Eniyan wa Ti Sọ",
      subtitle: "Ọpọ ẹlegbẹ ti Fasiti ti ṣe pataki",
    },
    cta: {
      title: "Ṣe o wẹ ati itan suwẹ",
      subtitle: "Darap pelu ẹgbẹ alailẹgbẹ ti ń ṣe iwẹ",
      button: "Bẹrẹ Ni Igba Yii",
    },
    footer: {
      tagline: "Fún àwọn ẹ̀kọ́ ní agbara",
      copyright: "© 2026 Fasiti. Gbogbo ètò pé.",
      quickLinks: "Awọn Njikọ Ojú",
      company: "Orilẹ",
      resources: "Awọn Ohun-ini",
      legal: "Ẹkọ",
      home: "Ilé",
      features: "Awọn Ẹya",
      dashboard: "Dashboard",
      privacy: "Eto Arinolo",
      terms: "Awọn Eri",
      contact: "Ba wa ni Olusokan",
      email: "Imel: support@fasiti.io",
      phone: "Fóònù: +234 (0) 123 456 7890",
      address: "Ẹkọ, Sìmìlì Oríílẹ",
      followUs: "Tẹ Wi",
    },
    faqs: {
      title: "Ibeere Ti A Beere Nigbagbogbo",
      subtitle: "Wa awọn idahun si awọn ibeere ti o wọpọ nipa Fasiti",
      questions: [
        {
          question: "Kini Fasiti?",
          answer: "Fasiti jẹ ọwọ-eto UTME ati Post-UTME ti o ni agbara AI.",
        },
      ],
    },
    pages: {
      privacy: {
        title: "Ètò Ìkọkọ",
        lastUpdated: "Ìgbakìjì ayẹ: Ìbẹrẹ 2026",
        intro: "Ni Fasiti, a ni ṣiṣẹ latọwọ ikokọ rẹ.",
        sections: [],
      },
      terms: {
        title: "Awọn Onigbese Iṣẹ",
        lastUpdated: "Ìgbakìjì ayẹ: Ìbẹrẹ 2026",
        intro: "Nipa iwole ati lilo Fasiti, o gba ati o ni aniyan.",
        sections: [],
      },
      contact: {
        title: "Bawo Ni O Le Pade Wa",
        subtitle: "O ni ibeere? A fẹ gbalẹ rẹ.",
        email: "support@fasiti.io",
        emailLabel: "Imel",
        phone: "+234 (0) 123 456 7890",
        phoneLabel: "Fonu",
        address: "Ẹkọ, Naija",
        addressLabel: "Adirẹsì",
        message: "Awọn eniyan akunnu wa n gbalẹjẹ funra ni iwọn 24 wakati.",
      },
    },
  },
  ar: {
    nav: {
      features: "الميزات",
      howItWorks: "كيف يعمل",
      reviews: "الآراء",
      signin: "تسجيل الدخول",
      signup: "التسجيل",
    },
    hero: {
      title: "احترف UTME و Post-UTME مع الذكاء الاصطناعي",
      subtitle:
        "استعد بذكاء باستخدام رؤى تعتمد على الذكاء الاصطناعي ومسارات تعلم شخصية.",
      cta: "ابدأ التجربة المجانية",
      startLearning: "ابدأ التعلم",
    },
    features: {
      title: "لماذا تختار Fasiti؟",
      subtitle: "كل ما تحتاجه لاجتياز امتحاناتك",
      aiTutor: {
        title: "معلم ذكي",
        description: "احصل على شرح فوري وإرشادات شخصية من معلمنا.",
      },
      smartPath: {
        title: "مسار التعلم الذكي",
        description: "تتعلم خوارزميتنا من نقاط ضعفك وتنشئ خطة مخصصة.",
      },
      practiceTests: {
        title: "اختبارات الممارسة",
        description: "مئات الأسئلة السابقة واختبارات وهمية.",
      },
      tracking: {
        title: "تتبع التقدم",
        description: "راقب تحسنك من خلال تحليلات مفصلة.",
      },
    },
    howItWorks: {
      title: "كيف يعمل",
      subtitle: "ثلاث خطوات بسيطة للنجاح",
      step1: { title: "قم بالتسجيل", description: "أنشئ حسابك واختر مواضيعك." },
      step2: {
        title: "الممارسة",
        description: "خذ الاختبارات واحصل على شروحات.",
      },
      step3: { title: "اتقن", description: "تتبع تقدمك وحقق أهدافك." },
    },
    reviews: {
      title: "ماذا يقول مستخدمونا",
      subtitle: "حسّن آلاف الطلاب درجاتهم.",
    },
    cta: {
      title: "هل أنت مستعد؟",
      subtitle: "انضم إلى آلاف الطلاب.",
      button: "ابدأ اليوم",
    },
    footer: {
      tagline: "تمكين الطلاب لتحقيق نجاح الامتحان",
      copyright: "© 2026 Fasiti. جميع الحقوق محفوظة.",
      quickLinks: "الروابط السريعة",
      company: "الشركة",
      resources: "الموارد",
      legal: "القانونية",
      home: "الصفحة الرئيسية",
      features: "المميزات",
      dashboard: "لوحة التحكم",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      contact: "اتصل بنا",
      email: "البريد: support@fasiti.io",
      phone: "الهاتف: +234 (0) 123 456 7890",
      address: "لاغوس، نيجيريا",
      followUs: "تابعنا",
    },
    faqs: {
      title: "الأسئلة الشائعة",
      subtitle: "ابحث عن إجابات للأسئلة حول Fasiti",
      questions: [
        {
          question: "ما هو Fasiti؟",
          answer: "Fasiti هي منصة تحضير UTME مدعومة بالذكاء الاصطناعي.",
        },
      ],
    },
    pages: {
      privacy: {
        title: "سياسة الخصوصية",
        lastUpdated: "آخر تحديث: يناير 2026",
        intro: "في Fasiti، نلتزم بحماية خصوصيتك.",
        sections: [],
      },
      terms: {
        title: "شروط الخدمة",
        lastUpdated: "آخر تحديث: يناير 2026",
        intro: "من خلال الوصول إلى Fasiti واستخدامها فإنك توافق.",
        sections: [],
      },
      contact: {
        title: "اتصل بنا",
        subtitle: "هل لديك أسئلة؟ نود أن نسمع منك.",
        email: "support@fasiti.io",
        emailLabel: "البريد الإلكتروني",
        phone: "+234 (0) 123 456 7890",
        phoneLabel: "الهاتف",
        address: "لاغوس، نيجيريا",
        addressLabel: "العنوان",
        message: "يرد فريقنا عادة خلال 24 ساعة.",
      },
    },
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.en;
};
