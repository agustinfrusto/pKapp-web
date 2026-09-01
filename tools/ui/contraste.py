import sys,json
def lum(hex_):
    h=hex_.lstrip('#')
    if len(h)==3: h=''.join(c*2 for c in h)
    r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    r,g,b=f(r),f(g),f(b)
    return 0.2126*r+0.7152*g+0.0722*b
def ratio(a,b):
    la,lb=lum(a),lum(b)
    hi,lo=max(la,lb),min(la,lb)
    return (hi+0.05)/(lo+0.05)
pares=json.load(open(sys.argv[1]))
rows=[]
for p in pares:
    r=ratio(p['fg'],p['bg'])
    umbral=3.0 if p.get('grande') else 4.5
    rows.append((p['nombre'],p['fg'],p['bg'],round(r,2),umbral,'OK' if r>=umbral else 'FALLA'))
rows.sort(key=lambda x:x[3])
w=max(len(r[0]) for r in rows)
for n,fg,bg,r,u,st in rows:
    print(f"{st:5} {r:6.2f} (min {u})  {n:<{w}}  {fg} sobre {bg}")
print()
print(f"total {len(rows)} pares | fallan {sum(1 for r in rows if r[5]=='FALLA')}")
