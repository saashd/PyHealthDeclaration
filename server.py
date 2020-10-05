import json
import sys
from datetime import datetime

import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from flask import request

# .py to .exe : install pyinstaller and write in cmd: pyinstaller --onefile server.py

def parse_json():
    with open('config.json') as f:
        data = json.load(f)
        return data


# style df
def get_df(file):
    pd.set_option('display.width', 100000)
    pd.set_option('colheader_justify', 'center')
    df = pd.read_excel(file)
    df = df.fillna('')
    df = df.replace('\n', '', regex=True)
    return df


# create server
app = Flask(__name__)
CORS(app)


@app.route('/api/index', methods=['GET', 'POST'])
def index():
    df = get_df('declarationTable.xlsx')
    date_list=[]
    for date in df.Date:
        print('hello')
        print(type(date))
        print(date)
        datetime_object = datetime.strptime(date, '%Y_%m_%d_%H:%M')
        date_list.append(datetime_object)

    df.Date=date_list
    df = df.sort_values(by='Date', ascending=False)
    print(date_list)
    date_list = []
    for date in df.Date:
        datetime_object = date.strftime('%Y_%m_%d_%H:%M')
        date_list.append(datetime_object)
    df.Date = date_list
    print(df)
    debt_json = df.to_json(orient='records', force_ascii=False)
    ret = jsonify(json.loads(debt_json))
    return ret


@app.route('/api/Post', methods=['GET', 'POST'])
def addDeclaration():
    resource_df = get_df('declarationTable.xlsx')
    Date = request.json['Date']
    Name = request.json['Name']
    CellNum = request.json['CellNum']
    Id = request.json['Id']
    Coughing = request.json['Coughing']
    TemperatureAbove38 = request.json['TemperatureAbove38']
    ContactWithIll = request.json['ContactWithIll']
    Sign = request.json['Sign']

    newDeclaration = {'Date': Date, 'Name': Name, 'CellNum': CellNum,
                      'Id': Id, 'Coughing': Coughing,
                      'TemperatureAbove38': TemperatureAbove38, 'ContactWithIll': ContactWithIll,
                      'Sign': Sign}

    resource_df = resource_df.append(newDeclaration, ignore_index=True)
    resource_df.to_excel('declarationTable.xlsx', index=False)
    return json.dumps(newDeclaration, ensure_ascii=False)


def main():
    data = parse_json()
    host = data['localhost']
    port = data['port']
    if host == True:
        app.run(port=port)
    else:
        app.run(host='0.0.0.0', port=port)

    if input() == 'quit':
        sys.exit(0)
    return


if __name__ == '__main__':
    main()
