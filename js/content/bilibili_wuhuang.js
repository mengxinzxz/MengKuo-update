import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '极略武皇',
    mode: 'identity',
    intro: [
        '双方从随机十名武将（其中五名武将为暗将，仅选择方可见），双方依次抽取其中两张（第一次抽取为一张）作为自己的备选武将',
        '然后双方选择一至两名武将作为自己的武将牌，进行1v1对决，双将体力上限和体力值均为和-3',
        '一方武将阵亡后，其从自己的剩余备选武将中选择一至两名武将作为自己的武将牌继续战斗',
        '胜利条件：率先击败对方所有武将',
        '玩家方胜利后，可以选择对决强敌（？？/？？双将组合）。若选择对决，无论对局是否胜利均不会影响游戏结果（即玩家胜利）；若击败强敌，则会根据难度获得不同数额的萌币奖励',
    ],
    init() {
        lib.configOL.number = 2;
        lib.config.mode_config.identity.double_hp = 'hejiansan';
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return from.identity === to.identity ? 10 : -10;
                    },
                },
                game: {
                    //胜负检测
                    checkResult() {
                        game.over(game.wuhuangED || _status.characterMap[game.me.identity].length > 0);
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            if (!_status.characterlist) lib.skill.pingjian.initList();
                            ui.arena.classList.add('choose-character');
                            lib.init.onfree();
                            game.broadcastAll((p, t) => {
                                p.enemy = t; t.enemy = p;
                            }, game.players[0], game.players[1]);
                            _status.characterMap = { 'fan': [], 'zhong': [] };
                            const identity = ['fan', 'zhong'].randomGet(), target = player.enemy;
                            player.identity = identity;
                            target.identity = (identity == 'fan' ? 'zhong' : 'fan');
                            player.showIdentity();
                            target.showIdentity();
                            game.players.sortBySeat(identity == 'fan' ? player : target);
                            let turn = game.zhu = game.players[0], characters = _status.characterlist.randomRemove(10);
                            const videoId = lib.status.videoId++;
                            game.broadcastAll((id, characters) => {
                                const name = 'mode_hidden', list1 = characters.slice(0, 5), list2 = characters.slice(-5);
                                const dialog = ui.create.dialog('选择武将', [list1, 'character'], [list2, 'character']);
                                const nodes = dialog.buttons.randomGets(5);
                                nodes.forEach(node => {
                                    lib.character[name] ??= get.convertedCharacter(["", "", 1, [], ['forbidai', 'ext:活动萌扩/image/unknown.jpg']]);
                                    node.setBackground(name, "character");
                                    node.node.name.innerHTML = "未知将";
                                    node.node.name.dataset.nature = "";
                                    node.node.hp.remove();
                                    node.node.group.remove();
                                    node.node.intro.remove();
                                    node._customintro = uiintro => {
                                        uiintro.add('暂未知晓身份的武将，要不要选一选，猜猜看是什么呢');
                                    };
                                });
                                dialog.videoId = id;
                            }, videoId, characters);
                            while (characters.length) {
                                const numx = Math.min(2, 11 - characters.length, characters.length);
                                const result = await turn.chooseButton(true, numx).set('canChoose', characters).set('filterButton', button => {
                                    return _status.event.canChoose.includes(button.link);
                                }).set('onfree', numx == 1).set('dialog', videoId).set('ai', () => 1 + Math.random()).forResult();
                                if (result?.bool && result.links?.length) {
                                    _status.characterMap[turn.identity].addArray(result.links);
                                    characters.removeArray(result.links);
                                    game.broadcastAll((links, first, id) => {
                                        const dialog = get.idDialog(id);
                                        if (dialog) {
                                            let choice = [];
                                            for (let i = 0; i < dialog.buttons.length; i++) {
                                                const node = dialog.buttons[i];
                                                if (links.includes(node.link)) {
                                                    choice.push(node.node.name.innerHTML);
                                                    if (!first) node.refresh(node, node.link);
                                                    node.classList.add(first ? 'selectedx' : 'glow');
                                                }
                                            }
                                            dialog.content.firstChild.innerHTML = (!first ? '你' : '对手') + '选择了' + choice.join('、');
                                        }
                                    }, result.links, turn !== player, videoId);
                                    turn = turn.enemy;
                                }
                            }
                            game.broadcastAll('closeDialog', videoId);
                            for (const current of [player, target]) {
                                const result = await current.chooseButton(true, ['请选择出场武将', [_status.characterMap[current.identity], 'character']], [1, 2]).set('ai', () => -0.5 + Math.random()).forResult();
                                if (result?.bool && result.links?.length) {
                                    _status.characterMap[current.identity].removeArray(result.links);
                                    current.init(result.links[0], result.links[1] ? result.links[1] : null);
                                    game.log(current, (current.name2 ? '<span class="bluetext">/' + get.translation(current.name2) + '</span>' : ''), '出场');
                                }
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    translate: {
                        fan: '先',
                        fan2: '先手',
                        zhong: '后',
                        zhong2: '后手',
                    },
                    element: {
                        player: {
                            logAi() { },
                            dieAfter() {
                                const target = this;
                                if (!_status.characterMap[game.me.identity].length || (game.wuhuangED && target == game.me.enemy)) game.checkResult();
                            },
                            dieAfter2() {
                                let next, target = this;
                                if (target === game.me || _status.characterMap[game.me.enemy.identity].length) {
                                    next = game.createEvent('replacePlayerSingle', false, _status.event.getParent());
                                    next.player = target;
                                    next.forceDie = true;
                                    next.setContent(async function (event, trigger, player) {
                                        await game.delay();
                                        const source = player, characters = _status.characterMap[source.identity];
                                        const result = characters.length > 1 ? await source.chooseButton(true, ['请选择出场武将', [characters, 'character']], [1, Math.min(2, characters.length)]).set('forceDie', true).set('ai', () => -0.5 + Math.random()).forResult() : { bool: true, links: characters };
                                        const names = result.links, color = source.node.identity.dataset.color;
                                        game.broadcastAll((player, names, color) => {
                                            player.revive(null, false);
                                            player.uninit();
                                            player.init(names[0], names[1] ? names[1] : null);
                                            player.node.identity.dataset.color = color;
                                            _status.characterMap[player.identity].removeArray(names);
                                        }, source, names, color);
                                        game.log(source, (source.name2 ? '<span class="bluetext">/' + get.translation(source.name2) + '</span>' : ''), '出场');
                                        await source.draw(4);
                                        const evt = event.getParent('dying');
                                        if (evt?.parent) evt.parent.untrigger(false, source);
                                        game.addVideo('reinit', source, [names[0], color]);
                                        await game.triggerEnter(source);
                                    });
                                }
                                else {
                                    next = game.createEvent('challengeWuHuang', false, _status.event.getParent());
                                    next.player = game.me;
                                    next.target = target;
                                    next.includeOut = true;
                                    next.setContent(async function (event, trigger, player) {
                                        const result = await player.chooseBool('武皇：是否挑战强敌？', '若不挑战，则以游戏胜利结束本局游戏；若挑战，即使挑战失败，亦判定玩家游戏胜利').set('includeOut', true).forResult();
                                        if (result?.bool) {
                                            game.wuhuangED = true;
                                            let names = [
                                                [['re_guojia', 're_huatuo'], 250],
                                                [['re_zhenji', 're_zhangjiao'], 250],
                                                [['jin_simashi', 're_huanggai'], 500],
                                                [['re_xusheng', 'shen_ganning'], 750],
                                                [['shen_guojia', 'shen_xunyu'], 750],
                                                [['ol_nanhualaoxian', 'pot_yuji'], 750],
                                                [['ol_jiangwan', 'ol_feiyi'], 750],
                                                [['xia_shitao', 'huan_caoang'], 1500],
                                                [['wu_zhugeliang', 'huan_zhugeliang'], 2500],
                                            ].filter(list => {
                                                return list[0].every(i => _status.characterlist.includes(i));
                                            }).randomGet();
                                            lib.onover.push(() => {
                                                const num = _status.source;
                                                if (!game.players.includes(game.me.enemy)) {
                                                    game.bolSay(`恭喜击败强敌${get.translation(game.me.enemy.name1)}/${get.translation(game.me.enemy.name2)}，获得${num}萌币`);
                                                    game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + num);
                                                }
                                                else game.bolSay(`失败乃成功之母，祝你下次好运`);
                                            });
                                            _status.source = names[1], names = names[0];
                                            const color = target.node.identity.dataset.color;
                                            game.broadcastAll(function (player, names, color) {
                                                player.revive(null, false);
                                                player.uninit();
                                                player.init(names[0], names[1]);
                                                player.node.identity.dataset.color = color;
                                                _status.characterlist.removeArray(names);
                                            }, target, names, color);
                                            game.log(target, '<span class="bluetext">/' + get.translation(target.name2) + '</span>', '出场');
                                            await target.draw(4);
                                            target.$fullscreenpop('强敌来袭', 'fire');
                                            const evt = event.getParent('dying');
                                            if (evt?.parent) evt.parent.untrigger(false, target);
                                            game.addVideo('reinit', target, [names[0], color]);
                                            await game.triggerEnter(target);
                                        }
                                        else game.over(true);
                                    });
                                }
                            },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            game.players.forEach(i => Object.assign(i, changeFunction.lib.element.player));
            game.showIdentity(true);
        },
    },
};
export default brawl;