import requests
import re
import socket
import struct
import time


def login(account, password):
    if re.match(r"^1\d{10}$", account):
        account = f"+86{account}"
        third_name = "huami_phone"
    else:
        third_name = "huami"

    headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "MiFit/6.12.0 (MCE16; Android 16; Density/1.5)",
        "app_name": "com.xiaomi.hm.health",
    }

    url1 = f"https://api-user.huami.com/registrations/{account}/tokens"
    data1 = f"client_id=HuaMi&country_code=CN&json_response=true&name={account}&password={password}&redirect_uri=https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html&state=REDIRECTION&token=access"
    res1 = requests.post(url1, data=data1, headers=headers)

    if res1.status_code == 200:
        res1 = res1.json()
        if "access" in res1:
            print("登录成功")
            code = res1["access"]
        else:
            print("用户名或密码不正确")
            return None, None
    elif res1.status_code == 429:
        print("请求过于频繁，请稍后再试")
        return None, None
    else:
        print(f"登录失败，状态码：{res1.status_code}")
        return None, None

    url2 = "https://account.huami.com/v2/client/login"
    data2 = f"app_name=com.xiaomi.hm.health&country_code=CN&code={code}&device_id=00:00:00:00:00:00&device_model=android_phone&app_version=6.12.0&grant_type=access_token&allow_registration=false&source=com.xiaomi.hm.health&third_name={third_name}"
    res2 = requests.post(url2, data=data2, headers=headers)

    if res2.status_code == 200:
        res2 = res2.json()
        login_token = res2["token_info"]["login_token"]
        user_id = res2["token_info"]["user_id"]
        print(f"获取Token成功，User ID={user_id}")
        return login_token, user_id
    else:
        print("获取Token失败")
        return None, None


def get_app_token(login_token):
    headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "MiFit/6.12.0 (MCE16; Android 16; Density/1.5)",
        "app_name": "com.xiaomi.hm.health",
    }
    url = f"https://account-cn.huami.com/v1/client/app_tokens?login_token={login_token}"
    res = requests.get(url, headers=headers)

    if res.status_code == 200:
        res_data = res.json()
        if "token_info" in res_data:
            print("获取app_token成功")
            return res_data["token_info"]["app_token"]
    print("获取app_token失败")
    return None


def get_timestamp():
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        client.settimeout(5)
        data = bytearray(48)
        data[0] = 0x1B
        client.sendto(data, ('ntp.ntsc.ac.cn', 123))
        data, _ = client.recvfrom(1024)
        if data:
            unpacked = struct.unpack('!12I', data[:48])
            return int(unpacked[10] - 2208988800)
    except:
        pass
    finally:
        try:
            client.close()
        except:
            pass
    return int(time.time())


def change_steps(user_id, app_token, steps):
    timestamp = get_timestamp()
    date_today = time.strftime("%F")
    device_id = "0000000000000000"

    data_json = "%5b%7b%22data_hr%22%3a%22" + "%5c%2fv7%2b" * 480 + f"%22%2c%22date%22%3a%22{date_today}%22%2c%22data%22%3a%5b%7b%22start%22%3a0%2c%22stop%22%3a1439%2c%22value%22%3a%22" + "A" * 5760 + f"%22%2c%22tz%22%3a32%2c%22did%22%3a%22{device_id}%22%2c%22src%22%3a24%7d%5d%2c%22summary%22%3a%22%7b%5c%22v%5c%22%3a6%2c%5c%22slp%5c%22%3a%7b%5c%22st%5c%22%3a0%2c%5c%22ed%5c%22%3a0%2c%5c%22dp%5c%22%3a0%2c%5c%22lt%5c%22%3a0%2c%5c%22wk%5c%22%3a0%2c%5c%22usrSt%5c%22%3a-1440%2c%5c%22usrEd%5c%22%3a-1440%2c%5c%22wc%5c%22%3a0%2c%5c%22is%5c%22%3a0%2c%5c%22lb%5c%22%3a0%2c%5c%22to%5c%22%3a0%2c%5c%22dt%5c%22%3a0%2c%5c%22rhr%5c%22%3a0%2c%5c%22ss%5c%22%3a0%7d%2c%5c%22stp%5c%22%3a%7b%5c%22ttl%5c%22%3a{steps}%2c%5c%22dis%5c%22%3a0%2c%5c%22cal%5c%22%3a0%2c%5c%22wk%5c%22%3a0%2c%5c%22rn%5c%22%3a0%2c%5c%22runDist%5c%22%3a0%2c%5c%22runCal%5c%22%3a0%2c%5c%22stage%5c%22%3a%5b%5d%7d%2c%5c%22goal%5c%22%3a0%2c%5c%22tz%5c%22%3a%5c%2228800%5c%22%7d%22%2c%22source%22%3a24%2c%22type%22%3a0%7d%5d"

    headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "MiFit/6.12.0 (MCE16; Android 16; Density/1.5)",
        "app_name": "com.xiaomi.hm.health",
        "apptoken": app_token,
    }
    url = f"https://api-mifit-cn.huami.com/v1/data/band_data.json?&t={timestamp}"
    data = f"userid={user_id}&last_sync_data_time={timestamp}&device_type=0&last_deviceid={device_id}&data_json={data_json}"

    try:
        res = requests.post(url, data=data, headers=headers)
        return res.json().get('message') == 'success'
    except:
        return False
