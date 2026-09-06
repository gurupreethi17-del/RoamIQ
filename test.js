const test = async (q) => {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    console.log(data[0][0][0]);
    console.log("Detected Source:", data[2]);
};
test('Kya karta hai tu');
test('तुम क्या कर रहे हो');
