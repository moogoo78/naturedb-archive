import math
from datetime import datetime, timedelta

def get_time(**args):
    if args:
        return datetime.utcnow() + timedelta(**args)
    else:
        return datetime.utcnow() + timedelta(hours=+8)


# via: https://en.proft.me/2015/09/20/converting-latitude-and-longitude-decimal-values-p/
def dd2dms(deg):
    '''Decimal-Degrees (DD) to Degrees-Minutes-Seconds (DMS)'''
    deg = float(deg) # 原本 decimal 欄位改成 char, 失去 decimal type
    d = int(deg)
    md = abs(deg - d) * 60
    m = int(md)
    sd = (md - m) * 60
    return [d, m, sd]
