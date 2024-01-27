import requests
import re
from bs4 import BeautifulSoup

url='http://wufazhuce.com/one/'#每一期的链接共同的部分
words=['0']*1800#定义一个长度为1800的列表，用来保存每一句话，并初始化为全‘0’
for i in range(14,1774):
    s=str(i)#数字类型转为字符串类型
    currenturl=url+s#当前期的链接
    try:
        res=requests.get(currenturl)
        res.raise_for_status()
    except requests.RequestException as e:#处理异常
        print(e)
    else:
        html=res.text#页面内容
        soup = BeautifulSoup(html,'html.parser')
        a=soup.select('.one-titulo')#查找期次所在的标签
        b=soup.select('.one-cita')#查找“每日一句”所在的标签
        index=re.sub("\D","",a[0].string.split()[0])#从“vol.xxx”提取期次数值作为下标
        if(index==''):
            continue
        words[int(index)]=b[0].string.split()#将该期“每日一句”存入列表
        word = words[int(index)]
        if len(word) == 2:
            print('"' + word[0].split("by")[0] + "——" + word[1] + '",')
        else:
            print('"' + word[0].split("by")[0] + '",')

f=open("one2.txt","a",encoding='utf-8')#将每句话写入这个txt文件中，先打开
print("Storaging.....")
for i in range(1,1774):
    if(words[i]=='0'):
        continue
    else:
        f.writelines(words[i])#写入该句话
        f.writelines('\n\n')#换行，并空一行写入下一句        
f.close()#关闭文件