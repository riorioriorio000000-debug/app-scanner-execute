import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'ar';

const T = {
  en: {
    tabs: { apps: 'Apps', editor: 'Editor', permissions: 'Permissions' },
    apps: {
      title: 'Apps',
      subtitle: 'Select a target app',
      subtitleSelected: 'Selected',
      search: 'Search apps…',
      addApp: 'Add App',
      namePlaceholder: 'App name (optional)',
      pkgPlaceholder: 'Package name (e.g. com.example.app)',
      note: 'Full listing requires an APK build with QUERY_ALL_PACKAGES permission. Add custom packages above.',
      start: 'Start',
      noApps: 'No apps found',
      confirm: 'Add',
    },
    editor: {
      title: 'Editor',
      noApp: 'No app selected',
      target: 'Target',
      run: 'Run',
      running: 'Running…',
      clear: 'Clear',
      console: 'Console',
      noOutput: '// No output yet — press Run',
    },
    perms: {
      title: 'Permissions',
      subtitle: 'Grant access for full functionality',
      standard: 'STANDARD',
      androidReq: 'ANDROID / APK REQUIRED',
      allGranted: 'All standard permissions granted',
      granted: 'Granted',
      denied: 'Denied',
      tapToReq: 'Tap to request',
      na: 'N/A',
      apkNote: 'Overlay, Accessibility, and Query Apps require a custom Android APK build.',
      openSettings: 'Open Settings',
    },
    float: {
      editor: 'Code Editor',
      run: 'Run',
      clear: 'Clear',
      placeholder: '// API.log("msg")  — print\n// await API.wait(ms) — delay\n// app — selected app info',
    },
  },
  ar: {
    tabs: { apps: 'التطبيقات', editor: 'المحرر', permissions: 'الأذونات' },
    apps: {
      title: 'التطبيقات',
      subtitle: 'اختر تطبيقاً هدفاً',
      subtitleSelected: 'محدد',
      search: 'بحث عن التطبيقات…',
      addApp: 'إضافة تطبيق',
      namePlaceholder: 'اسم التطبيق (اختياري)',
      pkgPlaceholder: 'اسم الحزمة (مثل com.example.app)',
      note: 'القائمة الكاملة تتطلب APK مع إذن QUERY_ALL_PACKAGES. أضف حزمات مخصصة أعلاه.',
      start: 'ابدأ',
      noApps: 'لا توجد تطبيقات',
      confirm: 'إضافة',
    },
    editor: {
      title: 'المحرر',
      noApp: 'لم يتم اختيار تطبيق',
      target: 'الهدف',
      run: 'تشغيل',
      running: 'جاري التشغيل…',
      clear: 'مسح',
      console: 'الكونسول',
      noOutput: '// لا يوجد إخراج — اضغط تشغيل',
    },
    perms: {
      title: 'الأذونات',
      subtitle: 'امنح الصلاحيات للوظائف الكاملة',
      standard: 'قياسي',
      androidReq: 'أندرويد / APK مطلوب',
      allGranted: 'جميع الأذونات القياسية ممنوحة',
      granted: 'ممنوح',
      denied: 'مرفوض',
      tapToReq: 'اضغط للطلب',
      na: 'غير متاح',
      apkNote: 'الطبقة فوق التطبيقات، وإمكانية الوصول، والاستعلام تتطلب APK أندرويد مخصص.',
      openSettings: 'فتح الإعدادات',
    },
    float: {
      editor: 'محرر الكود',
      run: 'تشغيل',
      clear: 'مسح',
      placeholder: '// API.log("msg")  — طباعة\n// await API.wait(ms) — تأخير\n// app — معلومات التطبيق المحدد',
    },
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof T['en'];
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LangProvider');
  return ctx;
}
