import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '兵精粮足',
    mode: 'identity',
    intro: [
        '八人军争模式',
        '所有人的体力上限和体力值+1',
        '所有人摸牌阶段多摸一张牌，出牌阶段可以额外使用一张【杀】',
        '所有涉及按伤害点数为次数发动的技能均改为按一次发动',
    ],
    showcase() {
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
                var trans = lib.translate[skill + '_info'];
                if (typeof trans === 'string' && (/造成.*?点伤害后/.test(trans) || /受到.*?点伤害后/.test(trans))) {
                    lib.translate[skill + '_info'] = lib.translate[skill + '_info'].replace(/造成\d+点伤害后/g, "造成伤害后");
                    lib.translate[skill + '_info'] = lib.translate[skill + '_info'].replace(/受到\d+点伤害后/g, "受到伤害后");
                    const origin = lib.skill[skill]?.getIndex;
                    if (typeof origin === 'function') {
                        lib.skill[skill].getIndex = function (event) {
                            return event.name === 'damage' ? 1 : origin.apply(this, arguments);
                        };
                    }
                }
            }
            for (var name in lib.character) {
                lib.character[name].hp = lib.character[name].hp + 1;
                lib.character[name].maxHp = lib.character[name].maxHp + 1;
            }
        },
    },
};
export default brawl;