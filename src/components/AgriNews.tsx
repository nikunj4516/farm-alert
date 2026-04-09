interface NewsItem {
  title: string;
  source: string;
  time: string;
}

const newsItems: NewsItem[] = [
  {
    title: "📢 ગુજરાત: MSP ઘઉંનો ભાવ ₹2275 પ્રતિ ક્વિન્ટલ જાહેર",
    source: "કૃષિ વિભાગ",
    time: "2 કલાક પહેલા",
  },
  {
    title: "🚜 PM કિસાન યોજના: 17મો હપ્તો ટૂંક સમયમાં",
    source: "સરકારી યોજના",
    time: "5 કલાક પહેલા",
  },
  {
    title: "🌧️ ચોમાસું સમયસર આવશે, IMD અનુમાન",
    source: "હવામાન વિભાગ",
    time: "1 દિવસ પહેલા",
  },
  {
    title: "🧪 માટી પરીક્ષણ મફત — નજીકની KVK પર",
    source: "કૃષિ કેન્દ્ર",
    time: "2 દિવસ પહેલા",
  },
];

const AgriNews = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-farmer-lg font-bold text-foreground">
        📰 ખેતી સમાચાર
      </h2>
      <div className="space-y-3">
        {newsItems.map((item, index) => (
          <button
            key={index}
            className="w-full text-left bg-card border-2 border-border rounded-lg p-4 active:bg-muted transition-colors touch-manipulation"
          >
            <p className="text-farmer-base font-semibold text-foreground mb-2">
              {item.title}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">
                {item.source}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.time}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgriNews;
