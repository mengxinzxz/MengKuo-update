import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '主公杀',
    mode: 'identity',
    intro: [
        '五人军争模式，身份分配和胜利条件同普通五人身份局',
        '主公特殊技能：【明察】————游戏开始时，你可知晓一名其他角色的身份是否为反贼（其他角色可见）。',
        '所有角色视为拥有技能：【奋战】————锁定技。①结束阶段，若你本回合造成过伤害，你获得1枚“战”标记（你至多3枚“战”标记），否则你移除1枚“战”标记；②准备阶段，你摸等同“战”标记数量的牌。',
        '击杀奖惩新增一条：内奸/反贼击杀忠臣摸三张牌',
        '场上两名角色阵亡后，所有角色出牌阶段使用【杀】的额定次数+1',
    ],
    init: function () {
        if (lib.skill._fenghuyunlong) delete lib.skill._fenghuyunlong;//防止忠臣身份查探
        lib.element.player.dieAfter2 = function (source) {
            if (this.identity == 'fan' && source) source.draw(3);
            else if (this.identity == 'zhong' && source) {
                if (source.identity == 'zhu' && source.isZhu) source.discard(source.getCards('he'));
                else if (source.identity == 'nei' || source.identity == 'fan') source.draw(3);
            }
        };
        lib.configOL.number = 5;
        var skills = {
            bol_mingcha: {
                charlotte: true,
                superCharlotte: true,
                trigger: { global: 'phaseBefore', player: 'enterGame' },
                filter: function (event, player) {
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                direct: true,
                content: function () {
                    'step 0'
                    player.chooseTarget(get.prompt('bol_mingcha'), '公开查探一名其他角色的身份是否为反贼', lib.filter.notMe).set('ai', function (target) {
                        return 1 + Math.random();
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('bol_mingcha', target);
                        var str = (target.identity == 'fan' ? '的身份为' + get.bolColor('反贼', '#4EEE94') : '的身份为' + get.bolColor('忠臣', '#FFEC8B') + '/' + get.bolColor('内奸', '#0000FF'));
                        game.log(target, str);
                        if (target.identity == 'fan') {
                            target.setIdentity('fan');
                            target.node.identity.classList.remove('guessing');
                            target.fanfixed = true;
                            target.addExpose(114514);
                        }
                        else target.addExpose(5);
                        for (var i of game.players) {
                            if (i == target) continue;
                            var content = [get.translation(target) + str, [[target.name1], 'character']];
                            i.chooseControl('ok').set('dialog', content);
                        }
                    }
                },
            },
            bol_fenzhan: {
                charlotte: true,
                superCharlotte: true,
                marktext: '战',
                intro: { content: 'mark' },
                trigger: { player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'] },
                filter: function (event, player) {
                    if (event.name == 'phaseZhunbei') return player.hasMark('bol_fenzhan');
                    return (!player.getHistory('sourceDamage').length && player.hasMark('bol_fenzhan')) || (player.getHistory('sourceDamage').length && player.countMark('bol_fenzhan') < 3);
                },
                forced: true,
                content: function () {
                    if (trigger.name == 'phaseZhunbei') player.draw(player.countMark('bol_fenzhan'));
                    else {
                        if (!player.getHistory('sourceDamage').length && player.hasMark('bol_fenzhan')) player.removeMark('bol_fenzhan', 1);
                        if (player.getHistory('sourceDamage').length && player.countMark('bol_fenzhan') < 3) player.addMark('bol_fenzhan', 1);
                    }
                },
            },
            _bol_aozhan_buff: {
                ruleSkill: true,
                mod: {
                    cardUsable: function (card, player, num) {
                        if (card.name == 'sha' && game.dead.length >= 2) return num + 1;
                    },
                },
            },
        };
        game.bolLoadSkill(skills);
        var translate = {
            bol_mingcha: '明察',
            bol_mingcha_info: '游戏开始时，你可知晓一名其他角色的身份是否为反贼（其他角色可见）。',
            bol_fenzhan: '奋战',
            bol_fenzhan_info: '锁定技。①结束阶段，若你本回合造成过伤害，你获得1枚“战”标记（你至多3枚“战”标记），否则你移除1枚“战”标记；②准备阶段，你摸等同“战”标记数量的牌。',
        };
        game.bolLoadTrans(translate);
    },
    content: {
        gameStart: function () {
            for (var i of game.players) {
                i.dieAfter2 = function (source) {
                    if (this.identity == 'fan' && source) source.draw(3);
                    else if (this.identity == 'zhong' && source) {
                        if (source.identity == 'zhu' && source.isZhu) source.discard(source.getCards('he'));
                        else if (source.identity == 'nei' || source.identity == 'fan') source.draw(3);
                    }
                };
                if (i.identity == 'zhu') i.addSkill('bol_mingcha');
                i.addSkill('bol_fenzhan');
            }
        },
    },
};

export default brawl;