import json
import os
import sys
import webbrowser

import pandas as pd
from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask import request
import time
import glob


# .py to .exe : install pyinstaller and write in cmd: pyinstaller --onefile server.py


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
    df = df.sort_values(by='Date', ascending=False)
    debt_json = df.to_json(orient='records', force_ascii=False)
    ret = jsonify(json.loads(debt_json))
    return ret





@app.route('/api/Post', methods=['GET', 'POST'])
def addDeclaration():
    resource_df = get_df('declarationTable.xlsx')
    Date=request.json['Date']

    Name = request.json['Name']
    CellNum = request.json['CellNum']
    Id = request.json['Id']
    Coughing = request.json['Coughing']
    TemperatureAbove38 = request.json['TemperatureAbove38']
    ContactWithIll = request.json['ContactWithIll']
    Sign = request.json['Sign']


    newDeclaration = {'Date':Date,'Name': Name, 'CellNum': CellNum,
                      'Id': Id, 'Coughing': Coughing,
                      'TemperatureAbove38': TemperatureAbove38, 'ContactWithIll': ContactWithIll,
                      'Sign': Sign}

    resource_df = resource_df.append(newDeclaration, ignore_index=True)
    # resource_df = resource_df.sort_values(by='Customer', ascending=True)
    resource_df.to_excel('declarationTable.xlsx', index=False)
    return json.dumps(newDeclaration, ensure_ascii=False)


if __name__ == '__main__':
    print("Please Don't close this window until you're done")
    app.run(host='0.0.0.0', port="5000")
    if input() == 'quit':
        sys.exit(0)
