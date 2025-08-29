import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '僵尸模式',
    //people vs zomble[doge]
    mode: 'identity',
    intro: [
        '前言：本模式为部分复刻太阳神三国杀的僵尸模式（本模式为本人完全重置，与过去的僵尸模式扩展无关）',
        '本游戏共八人参与，身份为一名主公和七名忠臣，所有角色为单将',
        '主公和忠臣拥有专属技能【互助】：出牌阶段限一次，你可以弃置一张【桃】，令一名距离为1以内的其他主公或忠臣回复1点体力',
        '第二轮开始时，随机两名忠臣或内奸身份的角色于其回合开始时将身份更换为反贼，弃置区域内所有牌，将体力上限调整为5，摸五张牌，并获得反贼专属尸化技能',
        '忠臣死亡后，复活并将体力上限调整为3，将身份更换为内奸，摸三张牌，并获得内奸专属尸化技能',
        '内奸击杀内奸或忠臣后，将身份更换为反贼，失去内奸专属尸化技能并获得反贼专属尸化技能',
        '主公的回合开始前，获得一枚“退治”标记，主公死亡后，若场上存在其他忠臣，则随机一名忠臣成为新的主公（体力上限和体力值+1）并获得原主公“退治”标记数-1的“退治”标记',
        '当主公的“退治”标记数达到8后，或者第二轮的尸变全部完成后或场上没有忠臣角色后场上的反贼和内奸全部阵亡，则主忠获胜；反贼和内奸的获胜方式不变',
        '本模式击杀角色无奖惩机制，场上有角色满足游戏机制反贼尸化时游戏不会结束，其余条件与身份模式相同',
    ],
    init() {
        game.zomble = 0;
        lib.configOL.number = 8;
        lib.config.mode_config.identity.change_identity = false;
        lib.config.mode_config.identity.double_character = false;
        lib.config.mode_config.identity.identity[6] = ['zhu', 'zhong', 'zhong', 'zhong', 'zhong', 'zhong', 'zhong', 'zhong'];
        var skills = {
            _huzhu: {
                ruleSkill: true,
                enable: 'phaseUse',
                filter(event, player) {
                    if (player.identity != 'zhu' && player.identity != 'zhong') return false;
                    return player.countCards('h', { name: 'tao' }) && game.hasPlayer(function (target) {
                        return lib.skill._huzhu.filterTarget(null, player, target);
                    });
                },
                filterTarget(card, player, target) {
                    return target != player && ['zhu', 'zhong'].includes(target.identity) && target.isDamaged() && get.distance(player, target) <= 1;
                },
                usable: 1,
                filterCard: { name: 'tao' },
                content() {
                    target.recover();
                },
                ai: {
                    order: 1,
                    result: { target: 1 },
                },
            },
            _getZomble1: {
                ruleSkill: true,
                trigger: { player: 'phaseBeginStart' },
                filter(event, player) {
                    if (game.roundNumber < 2) return false;
                    else player._getZomble1 = true;
                    var list = game.filterPlayer(function (current) {
                        return current == player || !current._getZomble1;
                    });
                    list = list.randomGets(2 - game.zomble);
                    return !['zhu', 'fan'].includes(player.identity) && list.includes(player);
                },
                forced: true,
                firstDo: true,
                content() {
                    'step 0'
                    game.zomble++;
                    'step 1'
                    game.log(player, '感染了僵尸病毒');
                    player.discard(player.getCards('hej'))._triggered = null;
                    game.broadcastAll(function (player) {
                        player.node.name.innerHTML = '尸变' + get.slimName(player.name1);
                        player.node.avatar.setBackgroundImage('extension/活动萌扩/image/zomble_' + (player.sex == 'female' ? 'female' : 'male') + '.jpg');
                        player.identity = 'fan';
                        player.showIdentity();
                    }, player);
                    player.maxHp = 5;
                    player.hp = 5;
                    player.update();
                    'step 2'
                    player.draw(5)._triggered = null;
                    player.addSkill('fanZomble');
                },
            },
            fanZomble: {
                init(player) {
                    player.removeSkill('neiZomble');
                },
                mark: true,
                marktext: '尸',
                intro: {
                    content(storage) {
                        var str = '反贼尸化特殊技能：';
                        for (var i of lib.skill.fanZomble.group) {
                            str += '<br><li>' + lib.translate[i] + '：' + lib.translate[i + '_info'];
                        }
                        return str;
                    },
                },
                charlotte: true,
                group: ['paoxiao', 'wansha', 'fanZomble_xunmeng', 'fanZomble_zaibian', 'fanZomble_ganran'],
            },
            fanZomble_xunmeng: {
                trigger: { source: 'damageBegin1' },
                filter(event, player) {
                    return event.card && event.card.name == 'sha' && event.notLink();
                },
                forced: true,
                content() {
                    trigger.num++;
                    if (player.hp > 1) player.loseHp();
                },
            },
            fanZomble_zaibian: {
                getNum() {
                    var num = 1;
                    for (var i of game.players) {
                        if (['zhu', 'zhong'].includes(i.identity)) num++;
                        if (['fan', 'nei'].includes(i.identity)) num--;
                    }
                    return num;
                },
                trigger: { player: 'phaseUseBegin' },
                filter(event, player) {
                    return lib.skill.fanZomble_zaibian.getNum() > 0;
                },
                forced: true,
                content() {
                    player.draw(lib.skill.fanZomble_zaibian.getNum());
                },
            },
            fanZomble_ganran: {
                mod: {
                    cardname(card, player) {
                        var bool = false;
                        if (!_status.ganranCheck) {
                            _status.ganranCheck = true;
                            if (get.type(card) == 'equip') bool = true;
                            delete _status.ganranCheck;
                        }
                        if (bool) return 'tiesuo';
                    },
                },
            },
            neiZomble: {
                charlotte: true,
                mark: true,
                marktext: '尸',
                intro: {
                    content(storage) {
                        var str = '内奸尸化特殊技能：';
                        for (var i of lib.skill.neiZomble.group) {
                            str += '<br><li>' + lib.translate[i] + '：' + lib.translate[i + '_info'];
                        }
                        return str;
                    },
                },
                group: ['paoxiao', 'wansha', 'xueji', 'neiZomble_shishi', 'fanZomble_ganran'],
            },
            neiZomble_shishi: {
                trigger: { source: 'dieAfter' },
                forced: true,
                content() {
                    'step 0'
                    player.gainMaxHp();
                    player.recover();
                    'step 1'
                    if (['zhong', 'nei'].includes(trigger.player.identity)) {
                        game.log(player, '发生了进化');
                        game.broadcastAll(function (player) {
                            player.identity = 'fan';
                            player.showIdentity();
                        }, player);
                    }
                    else event.finish();
                    'step 2'
                    player.removeSkill('neiZomble');
                    player.addSkill('fanZomble');
                },
            },
            _zhu_tuizhi: {
                intro: { content: 'mark' },
                trigger: { player: 'phaseBegin' },
                filter(event, player) {
                    return player.identity == 'zhu';
                },
                forced: true,
                content() {
                    'step 0'
                    player.addMark('_zhu_tuizhi', 1);
                    'step 1'
                    if (player.countMark('_zhu_tuizhi') >= 8) {
                        player.$fullscreenpop('人类胜利', 'fire');
                        game.over(['zhu', 'zhong'].includes(game.me.identity));
                    }
                },
            },
            _logZomble: {
                trigger: { global: 'roundStart' },
                filterx(event, player) {
                    return game.roundNumber >= 2 && !game._logZomble;
                },
                forced: true,
                content() {
                    for (var i of game.players) delete i._getZomble1;
                    if (lib.skill._logZomble.filterx(trigger, player)) {
                        game._logZomble = true;
                        player.$fullscreenpop('尸变开始', 'thunder');
                    }
                },
            },
            _identityLogZomble: {
                charlotte: true,
                ruleSkill: true,
                trigger: { global: ['chooseButtonBefore', 'gameStart', 'gameDrawAfter', 'phaseBefore'] },
                filter(event, player) {
                    return !game._identityLogZomble;
                },
                direct: true,
                priority: 114 + 514 - 1919 - 810 + Infinity,
                content() {
                    'step 0'
                    game._identityLogZomble = true;
                    for (var target of game.filterPlayer()) {
                        if (target.identity != 'zhu') {
                            game.broadcastAll(function (player) {
                                player.identity = 'zhong';
                                player.showIdentity();
                            }, target);
                        }
                    }
                    'step 1'
                    game.showIdentity();
                },
            },
        };
        game.bol_loadSkill(skills);
        var translate = {
            _huzhu: '互助',
            _huzhu_info: '出牌阶段限一次，你可以弃置一张【桃】，令一名距离为1以内的其他主公或忠臣回复1点体力',
            fanZomble: '尸化·反贼',
            fanZomble_xunmeng: '迅猛',
            fanZomble_xunmeng_info: '锁定技，你使用【杀】造成的伤害+1，然后若你的体力值大于1，你失去1点体力。',
            fanZomble_zaibian: '灾变',
            fanZomble_zaibian_info: '锁定技，出牌阶段开始时，若X大于0，则你摸X张牌（X为主公角色数+忠臣角色数-反贼角色数-内奸角色数+1）。',
            fanZomble_ganran: '感染',
            fanZomble_ganran_info: '锁定技，你的装备牌牌名均视为【铁锁连环】。',
            neiZomble: '尸化·内奸',
            neiZomble_shishi: '噬尸',
            neiZomble_shishi_info: '锁定技，当你令一名角色尸变或杀死一名角色后，你加1点体力上限并回复1点体力。',
            _zhu_tuizhi: '退治',
        };
        game.bol_loadTrans(translate);
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            game.bol_wuhuang = {
                dieAfter() {
                    var player = this;
                    if (player.identity == 'fan' || player.identity == 'nei') player.$fullscreenpop('僵尸灭亡', 'thunder');
                    if ((game.zomble < 2 && game.players.some(target => target.identity == 'zhong' || target.identity == 'nei')) || player.identity == 'zhong' || (player.identity == 'zhu' && game.players.some(target => target.identity == 'zhong'))) return;
                    game.checkResult();
                },
                dieAfter2() {
                    var next, player = this;
                    if (player.identity == 'zhu') {
                        next = game.createEvent('setNewZhu', false, _status.event.getParent());
                        next.player = this;
                        next.forceDie = true;
                        next.setContent(function () {
                            'step 0'
                            var list = game.players.filter(current => current.identity == 'zhong');
                            var target = list.randomGet();
                            event.target = target;
                            player.line(target);
                            game.log(target, '成为了新的主公');
                            game.broadcastAll(function (player, target) {
                                delete player.isZhu;
                                target.identity = 'zhu';
                                target.showIdentity();
                                game.zhu = target;
                            }, player, target);
                            target.maxHp = target.maxHp + 1;
                            target.hp = target.hp + 1;
                            target.update();
                            'step 1'
                            if (player.countMark('_zhu_tuizhi')) target.addMark('_zhu_tuizhi', player.countMark('_zhu_tuizhi') - 1);
                        });
                    }
                    else if (player.identity == 'zhong') {
                        next = game.createEvent('setNewZomble', false, _status.event.getParent());
                        next.player = this;
                        next.forceDie = true;
                        next.setContent(function () {
                            'step 0'
                            game.log(player, '感染了僵尸病毒');
                            game.broadcastAll(function (player) {
                                player.node.name.innerHTML = '尸变' + get.slimName(player.name1);
                                player.node.avatar.setBackgroundImage('extension/活动萌扩/image/zomble_' + (player.sex == 'female' ? 'female' : 'male') + '.jpg');
                                player.identity = 'nei';
                                player.showIdentity();
                            }, player);
                            player.revive(null, false);
                            player.maxHp = 3;
                            player.hp = 3;
                            player.update();
                            'step 1'
                            player.draw(3)._triggered = null;
                            player.addSkill('neiZomble');
                        });
                    }
                },
            };
            for (var i in game.bol_wuhuang) lib.element.player[i] = game.bol_wuhuang[i];
            for (var i of game.players) {
                for (var j in game.bol_wuhuang) i[j] = game.bol_wuhuang[j];
            }
        },
    },
};
export default brawl;