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
    showcase(init) {
        var bjlz = ui.create.div();
        bjlz.style.height = '267px';
        bjlz.style.width = '500px';
        bjlz.style.left = 'calc(50% - 250px)';
        bjlz.style.top = '45px';
        bjlz.setBackgroundImage('extension/活动萌扩/image/bol_bingjingliangzu.png');
        this.appendChild(bjlz);
    },
    init() {
        lib.configOL.number = 8;
        const origin = lib.element.player.phaseDraw;
        lib.element.player.phaseDraw = function () {
            const next = origin.apply(this, arguments);
            if (typeof next.num === 'number') next.num++;
            return next;
        };
        lib.skill._bolbingjing2 = {
            charlotte: true,
            mod: {
                cardUsable(card, player, num) {
                    if (card.name == 'sha') return num + 1;
                },
            },
        };
    },
    content: {
        chooseCharacterBefore() {
            for (var skill in lib.skill) {
                var trans = get.plainText(lib.translate[skill + '_info'] || '');
                if (trans.includes('受到') && trans.includes('点伤害后')) {
                    while (trans.includes('点伤害后')) {
                        var num = trans.indexOf('点伤害后') - 1;
                        var trans1 = '';
                        for (var i = 0; i < num; i++) trans1 += trans[i];
                        var trans2 = trans.slice(num + 2);
                        trans = trans1 + trans2;
                    }
                    lib.translate[skill + '_info'] = trans;
                    const origin = lib.skill[skill]?.getIndex;
                    if (typeof origin === 'function') {
                        lib.skill[skill].getIndex = function () {
                            return Math.min(1, origin.apply(this, arguments));
                        };
                    }
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