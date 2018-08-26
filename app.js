'use strict';

// Node.js に用意されたモジュールを呼び出し
const fs = require('fs');
const readLine = require('readline');

// ファイルを読み込むStreamを生成
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readLine.createInterface({ 'input': rs, 'output': {} });

// key: 都道府県 value: 集計データのオブジェクト
const map = new Map();

// lineイベントが発生したら無名関数を呼ぶ(イベント駆動プログラム)
// 無名関数に渡す引数のlineString = 読み込んだCSVの内容1行
rl.on('line', (lineString) => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[2];
  const popu = parseInt(columns[7]);
  if (year === 2010 || year === 2015) {
    let value = map.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null,
      };
    }

    if (year === 2010) {
      value.popu10 += popu;
    }

    if (year === 2015) {
      value.popu15 += popu;
    }

    map.set(prefecture, value);
  }
});

// ストリームに情報を流し始める
rl.resume();

// 全ての行を読み込み終わった際に呼び出される
rl.on('close', () => {
  // keyAndValue の添え字 0 にキー、1 に値が入っている
  for (let keyAndValue of map) {
    const value = keyAndValue[1];
    value.change = value.popu15 / value.popu10;
  }

  // 連想配列を普通の配列に変換する処理。sort関数に無名関数を渡す
  const rankingArray = Array.from(map).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });

  // keyAndValue の添え字 0 にキー、1 に値が入っている
  const rankingStrings = rankingArray.map((keyAndValue) => {
    return keyAndValue[0] + ': ' + keyAndValue[1].popu10 + '=>' + keyAndValue[1].popu15 + ' 変化率:' + keyAndValue[1].change;
  });

  console.log(rankingStrings);
});
