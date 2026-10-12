import re,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from bs4 import BeautifulSoup
src='../stitch-export/original/stitch_export_4_screens.html.txt'
s=open(src).read()
new={"background":"#F8F6F6","surface":"#F8F6F6","surface-bright":"#F8F6F6","surface-dim":"#DDD7D7",
"surface-container-lowest":"#FFFFFF","surface-container-low":"#F6F3F3","surface-container":"#F0ECEC","surface-container-high":"#EAE5E5","surface-container-highest":"#E4DEDE","surface-variant":"#E4DEDE",
"on-surface":"#1A1512","on-background":"#1A1512","on-surface-variant":"#5E5658","outline":"#8A8082","outline-variant":"#E0D8D9",
"inverse-surface":"#2E2628","inverse-on-surface":"#F7F2F2","inverse-primary":"#E8BFC3",
"primary":"#8A2538","on-primary":"#FFFFFF","primary-container":"#A8343F","on-primary-container":"#FBE3E5","primary-fixed":"#F3D2D5","primary-fixed-dim":"#E8BFC3","on-primary-fixed":"#3A0A12","on-primary-fixed-variant":"#8A2538","surface-tint":"#8A2538",
"secondary":"#A8343F","on-secondary":"#FFFFFF","secondary-container":"#F3D2D5","on-secondary-container":"#5C1520","secondary-fixed":"#F9E3E5","secondary-fixed-dim":"#E8BFC3","on-secondary-fixed":"#5C1520","on-secondary-fixed-variant":"#7A1F2B",
"tertiary":"#D61F26","on-tertiary":"#FFFFFF","tertiary-container":"#E4575C","on-tertiary-container":"#FFFFFF","tertiary-fixed":"#FDE3E3","tertiary-fixed-dim":"#F5B1B3","on-tertiary-fixed":"#410004","on-tertiary-fixed-variant":"#A8151C",
"error":"#BA1A1A","on-error":"#FFFFFF","error-container":"#FFDAD6","on-error-container":"#93000A"}
def fix_cfg(m):
    return re.sub(r'"([a-z-]+)":"#[0-9a-fA-F]{6}"',lambda mm:'"%s":"%s"'%(mm.group(1),new[mm.group(1)]),m.group(0))
s=re.sub(r'<script id="tailwind-config">.*?</script>',fix_cfg,s,flags=re.S)
hard={'#0E1320':'#1A1512','#B3261E':'#D61F26','#FDE7E5':'#FDE3E3'}
for a,b in hard.items(): s=s.replace(a,b)
docs=[m.group(0) for m in re.finditer(r'<!DOCTYPE html>.*?</html>',s,flags=re.S)]
names=['1_school_admin_dashboard','2_signin','3_parent_portal','4_moe_hq_dashboard']
def norm(x): return re.sub(r'\s+',' ',x).strip()

def trim(doc,name):
    soup=BeautifulSoup(doc,'html.parser')
    js=' '.join(sc.get_text() for sc in soup.find_all('script'))
    removed=[0]
    def kill(e,why):
        if e is None or e.decomposed if hasattr(e,'decomposed') else False: return
        ids=[x.get('id') for x in e.find_all(True) if x.get('id')]+([e.get('id')] if e.get('id') else [])
        hit=[i for i in ids if i in js]
        if hit:
            e['style']=(e.get('style','')+';display:none').strip(';'); print('  hidden (js ref)',hit,why[:40]); return
        e.decompose(); removed[0]+=1
    def rm(prefix,up=0,exact=False,all_=False):
        found=0
        for n in list(soup.body.find_all(string=lambda x:x and (norm(x)==prefix if exact else norm(x).startswith(prefix)))):
            e=n.parent
            for _ in range(up):
                e=e.parent
            kill(e,prefix); found+=1
            if not all_: break
        if not found: print('  NOT FOUND',prefix[:50])
    # generic: descriptive leaf <p>
    keep_p=set(KEEP.get(name,[]))
    for i,p in enumerate(list(soup.body.find_all('p'))):
        if i in keep_p: continue
        if p.decomposed if hasattr(p,'decomposed') else False: continue
        kill(p,'p%d'%i)
    for rule in RULES.get(name,[]):
        rm(*rule[:1],**(rule[1] if len(rule)>1 else {}))
    for f in soup.body.find_all('footer'): kill(f,'footer')
    for sp in list(soup.body.find_all('span')):
        if norm(sp.get_text())=='•' and sp.get('class') and ('sm:inline' in ' '.join(sp.get('class')) or ('text-outline' in sp.get('class') and 'text-caption' in sp.get('class') and sp.find_next_sibling('span') and 'Riverside' in sp.find_next_sibling('span').get_text() and name.startswith('1_'))):
            sp.decompose()
    print(name,'removed',removed[0])
    return str(soup)

# p indexes to keep (see earlier listing)
KEEP={'1_school_admin_dashboard':[20],'2_signin':[5,6,7,8,10],'3_parent_portal':[1,2],'4_moe_hq_dashboard':[]}
RULES={
'1_school_admin_dashboard':[
 ('Scope: Riverside',dict(up=2)),
 ('Audited Scope',dict(up=2)),
 ('Institutional Boundary',dict()),
 ('LEDGER AUDIT',dict(up=1)),
 ('5 classes per level',dict()),('Primary 1 through Primary 6',dict()),('School managed',dict()),
 ('School Overview Hub',dict(up=1)),
 ('Statutory',dict(exact=True)),('Core Curriculum',dict(exact=True)),('School Discretionary',dict(exact=True)),('Mandatory',dict(exact=True)),
 ('SBFAS Absorbed',dict(all_=True)),
 ('SHA-256',dict()),
 ('Required for MOE compliance',dict()),
 ('Rows 1 to 3 verified',dict()),
 ('Burn Velocity',dict()),
],
'2_signin':[
 ('GovTech Secure',dict(exact=True)),
 ('Secure, end-to-end',dict(up=1)),
 ('Your financial identity',dict(up=0)),
 ('Official MOE Portal',dict(exact=True)),
 ('policy',dict(up=2,exact=True)),('Automated government top-ups',dict()),('Simplified digital FAS',dict()),('Protected payment gateway',dict()),
],
'3_parent_portal':[
 ('Across 2 students',dict(up=1)),
 ('Optional Co-curricular',dict()),
],
'4_moe_hq_dashboard':[
 ('Scope: Riverside',dict(up=2)),
 ('Audited Scope',dict(up=2)),
 ('Action locked in simulation',dict()),('All ledger actions synced',dict()),('Audit capture recorded',dict()),
 ('HQ Central Governance',dict()),('T+0 Real-Time',dict()),
 ('Across 4 zones',dict()),('98.9% Online',dict()),('Nationwide primary',dict()),('Across all levels',dict()),
 ('Active citizen accounts',dict()),('Singpass Auto-Created',dict(up=1)),
 ('Protocol: EF-SIM',dict()),('Singpass Real-Time Auth',dict()),
 ('Comprehensive appropriated',dict()),('Authority: MOF',dict()),('Statutory Ringfence',dict()),
 ('Includes Textbook',dict()),('Auto-Grant Stream',dict()),('Singpass API Sync',dict()),('Ages 7–16 Auto-Lifecycle',dict()),
 ('Current primary 1 intake',dict()),('Scheduled for post-secondary',dict()),
 ('Strategic Educational Finance Portal',dict(up=0)),
 ('Simulation Session ID',dict(up=1)),
 ('Module EP-03',dict()),
 ('System-Wide Scope',dict()),('All schools • HQ management',dict()),('Signed in as:',dict(up=0)),
],
}
import os
os.makedirs('../stitch-export/red',exist_ok=True)
for d,n in zip(docs,names):
    open('../stitch-export/red/%s_red.html'%n,'w').write(trim(d,n))
