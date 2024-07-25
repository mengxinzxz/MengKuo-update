import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '兵精粮足',
    mode: 'identity',
    intro: [
        '八人军争模式',
        '所有人的体力上限和体力值+1',
        '所有人摸牌阶段多摸一张牌，出牌阶段可以额外使用一张杀',
        '所有涉及“受到伤害后”的技能均改为按次数发动'
    ],
    showcase: function (init) {
        var bjlz = ui.create.div();
        bjlz.style.height = '267px';
        bjlz.style.width = '500px';
        bjlz.style.left = 'calc(50% - 250px)';
        bjlz.style.top = '45px';
        bjlz.setBackgroundImage('extension/活动萌扩/image/bolbingjingliangzu.png');
        this.appendChild(bjlz);
    },
    init: function () {
        lib.configOL.number = 8;
        lib.skill._bolbingjing1 = {
            charlotte: true,
            trigger: { player: 'phaseDrawBegin1' },
            direct: true,
            priority: Infinity,
            content: function () {
                trigger.num++;
            },
        };
        lib.skill._bolbingjing2 = {
            charlotte: true,
            mod: {
                cardUsable: function (card, player, num) {
                    if (card.name == 'sha') return num + 1;
                },
            },
        };
        lib.skill._bolbingjing3 = {
            charlotte: true,
            trigger: { player: 'damageEnd' },
            direct: true,
            priority: Infinity,
            content: function () {
                trigger.num = 1;
            },
        };
    },
    content: {
        chooseCharacterBefore: function () {
            for (var skill in lib.skill) {
                var trans = lib.translate[skill + '_info'];
                if (trans && trans.indexOf('受到') != -1 && trans.indexOf('点伤害后') != -1) {
                    while (trans.indexOf('点伤害后') != -1) {
                        var num = trans.indexOf('点伤害后') - 1;
                        var trans1 = '';
                        for (var i = 0; i < num; i++) trans1 += trans[i];
                        var trans2 = trans.slice(num + 2);
                        trans = trans1 + trans2;
                    }
                    lib.translate[skill + '_info'] = trans;
                }
            }
            for (var name in lib.character) {
                if (typeof lib.character[name][2] == 'number') lib.character[name][2] = lib.character[name][2] + 1;
                else {
                    var hp = get.infoHp(lib.character[name][2]);
                    var maxHp = get.infoMaxHp(lib.character[name][2]);
                    var hujia = get.infoHujia(lib.character[name][2]);
                    if (hujia) lib.character[name][2] = (hp + 1) + '/' + (maxHp + 1) + '/' + (hujia + 1);
                    else lib.character[name][2] = (hp + 1) + '/' + (maxHp + 1);
                }
            }
        },
    },
};

export default brawl;