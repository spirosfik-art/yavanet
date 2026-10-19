# Φτιάχνει την έκδοση της παρουσίασης Βούλας χωρίς τιμή (voula-en-noprice.html) από την κύρια.
# Τρέξε το ξανά μετά από κάθε αλλαγή στο voula-en.html.
import pathlib
d = pathlib.Path(__file__).parent
s = (d / "voula-en.html").read_text()
R = [
 ('<div><div class="eye" style="color:var(--dim);font-size:18px">Asking price</div><div style="font:400 104px/1 var(--disp);margin-top:14px">€1,230,000</div></div>',
  '<div><div class="eye" style="color:var(--dim);font-size:18px">Price</div><div style="font:400 84px/1 var(--disp);margin-top:14px">On request</div></div>'),
 ('<div class="gauge"><div class="gtop"><span>Price</span><b>€1,230,000</b></div><div class="bar"><i></i><em style="left:65%"><span>Threshold €800,000</span></em></div><span class="ok">✓ 54% above the threshold</span></div>',
  '<div class="gauge"><div class="gtop"><span>Price</span><b>Above €800,000</b></div><div class="bar"><i></i></div><span class="ok">✓ Meets the €800,000 threshold</span></div>'),
 ('<div><span>Today · 3%</span><b class="pool">€36,900</b></div>', '<div><span>Today · 3%</span><b class="pool">€30,000</b></div>'),
 ('<div><span>From 2027 · 15%</span><b>€184,500</b></div>', '<div><span>From 2027 · 15%</span><b>€150,000</b></div>'),
 ('<div><span>Difference</span><b class="gold">€147,600</b></div>', '<div><span>Difference</span><b class="gold">€120,000</b></div>'),
 ('<span>Illustration on the €1,230,000 asking price</span>', '<span>Illustration per €1,000,000 of purchase price</span>'),
 ('<title>Voula Garden Maisonette · S.F. Properties</title>', '<title>Voula Garden Maisonette · S.F. Properties (price on request)</title>'),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
assert "1,230" not in s and "36,900" not in s
(d / "voula-en-noprice.html").write_text(s)
print("ok")
