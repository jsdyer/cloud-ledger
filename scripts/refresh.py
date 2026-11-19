"""Read the full federal disclosure CSV and build a reproducible direct-vendor edition."""
import argparse, csv, gzip, io, json, re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.request import Request, urlopen
from contextlib import closing
ROOT=Path(__file__).resolve().parents[1]
CSV='https://open.canada.ca/data/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b/resource/fac950c0-00d5-4ec1-a4d3-9cbebf98a305/download/contracts.csv'
INDEX='https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b'
ALIASES={'Microsoft':['Microsoft','Microsoft Corporation','Microsoft Canada','Microsoft Canada Inc','Microsoft Canada Co','Microsoft Canada Company','Microsoft Licensing GP','Microsoft Licensing','Microsoft Canada Ltd','Microsoft Services','MSLI Microsoft Licensing GP'],
'Oracle':['Oracle Canada ULC','Oracle Canada','Oracle Canada Inc','Oracle Canada LLC'],
'Amazon Web Services':['Amazon Web Services','Amazon Web Services Inc','Amazon Web Services Canada','Amazon Web Services Canada Inc','Amazon Web Services AWS','Amazon Web Services Inc Canada'],
'Google':['Google Cloud Canada Corporation','Google Cloud Canada Corp','Google Canada Corporation','Google Canada Corp','Google Canada Ltd','Google Canada Inc','Google Cloud Canada'],
'ThinkOn':['ThinkOn','ThinkOn Inc'],'Compugen':['Compugen','Compugen Inc','Compugen Incorporated'],'Softchoice':['Softchoice','Softchoice Corporation','Softchoice Canada Inc','Softchoice Canada Corporation'],'Sherweb':['Sherweb','Sherweb Inc'],'OVHcloud':['OVHcloud','OVH Hosting Inc','OVH Canada Inc','OVHcloud Canada','OVHcloud Canada Inc']}
def normalized(s):return re.sub('[^a-z0-9]+',' ',s.casefold()).strip()
ALIASES_BY_NAME={normalized(n):group for group,names in ALIASES.items() for n in names}
def cents(s):
    return None if not s.strip() else int(Decimal(s)*100)
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--file',type=Path);args=ap.parse_args()
    raw=args.file.open('rb') if args.file else urlopen(Request(CSV,headers={'User-Agent':'CoolCode Cloud Ledger'}),timeout=160)
    records=[];departments={}; scanned=0
    with io.TextIOWrapper(raw,encoding='utf-8-sig',newline='') as src:
        inputs=csv.DictReader(src)
        for line in inputs:
            scanned+=1
            group=ALIASES_BY_NAME.get(normalized(line['vendor_name']))
            period=line['reporting_period']
            if not group or not re.fullmatch(r'20\d\d-20\d\d-Q[1-4]',period) or period<'2021-2022-Q1':continue
            org=line['owner_org']
            departments[org]=line['owner_org_title'].split(' | ')[0]
            records.append([period,group,org,line['instrument_type'],cents(line['original_value']),cents(line['amendment_value']),cents(line['contract_value']),line['reference_number'],line['procurement_id'],line['vendor_name'],line['description_en'],line['contract_date']])
    if scanned<500000 or len(records)<500 or len(departments)<20:raise ValueError('Incomplete contract download')
    periods=sorted({r[0] for r in records})
    data={'retrieved':datetime.now(timezone.utc).date().isoformat(),'count':len(records),'firstPeriod':periods[0],'latestPeriod':periods[-1],'source':INDEX,'departments':departments,'fields':['period','vendor','department','instrument','originalCents','amendmentCents','contractCents','reference','procurement','filedVendor','description','contractDate'],'rows':sorted(records,key=lambda r:(r[0],r[7]),reverse=True)}
    out=ROOT/'web/data'; out.mkdir(exist_ok=True)
    compress=gzip.compress(json.dumps(data,separators=(',',':'),ensure_ascii=False).encode(),mtime=0)
    (out/'contracts.json.gz.tmp').write_bytes(compress);(out/'contracts.json.gz.tmp').replace(out/'contracts.json.gz')
    (out/'status.json').write_text(json.dumps({k:data[k] for k in ['retrieved','count','firstPeriod','latestPeriod']})+'\n')
    print('Reviewed',scanned,'source rows, selected',len(records),'in',len(departments),'institutions')
if __name__=='__main__':main()
