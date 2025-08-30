import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '青丘弄琴',
    mode: 'identity',
    intro: [
        '本扩展为复刻手杀山海志异模式中的青丘弄琴，游戏共分为三局，玩家与另一名角色组成盟军与本模式boss青女(九尾狐)对抗',
        '<span class=\'texiaotext\' style=\'color:#FF0000\'>盟军默认为4血白板</span>，且选择形象后从随机三个技能中选择一个作为初始技能',
        '盟军默认拥有技能【祀邪】（准备阶段，你可以从随机三个技能中获得一个技能，然后若你的非【祀邪】技能数大于3，则你选择失去一个非【祀邪】的技能）',
        '每个阶段的boss拥有不同的血量上限和技能，击杀boss后boss进行重整，boss于其回合开始时复活',
        '<span class=\'texiaotext\' style=\'color:#FF0000\'>一阶段boss【堕魔】数值累计+7，二阶段boss【堕魔】数值累计+12后亦会进入重整状态</span>，三个阶段【堕魔】数值均不重置',
        '击败三个形态的boss后盟军获得游戏胜利，盟军全员阵亡游戏失败',
    ],
    init() {
        lib.configOL.number = 3;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        lib.config.singleControlx = lib.config.extension_活动萌扩_singleControlx;
        lib.config.levelSkills = lib.config.extension_活动萌扩_levelSkills;
    },
    content: {
        submode: 'normal',
        //更改游戏配置
        chooseCharacterBefore() {
            //覆盖一些设置
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return from.identity == to.identity ? 10 : -10;
                    },
                },
                game: {
                    HuNvRound: 1,
                    HuNv_sixieSkills: [],
                    //死亡检查胜负情况
                    checkResult() {
                        if (!get.population(game.me.identity)) game.over(false);
                        else {
                            const list = game.players.map(i => i.identity).unique();
                            if (list.length == 1 && game.HuNvRound == 3) game.over(true);
                            else {
                                if (!ui.giveupSystem && (!game.players.includes(game.me.fellow) || lib.config.singleControlx)) {
                                    ui.giveupSystem = ui.create.system('投降', function () {
                                        game.log(game.me, '投降');
                                        game.over(false);
                                    }, true);
                                }
                            }
                        }
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            //首轮敌人初始化
                            game.HuNv.init('boss_qingnv1');
                            game.broadcastAll(HuNvRound => {
                                if (get.is.phoneLayout()) ui.LongZhouInfo = ui.create.div('.touchinfo.left', ui.window);
                                else ui.LongZhouInfo = ui.create.div(ui.gameinfo);
                                ui.LongZhouInfo.innerHTML = '青丘弄琴：第' + get.cnNumber(HuNvRound, true) + '回合';
                            }, game.HuNvRound);
                            //技能池
                            if (!_status.characterlist) lib.skill.pingjian.initList();
                            for (const name of _status.characterlist) {
                                if (lib.character[name][1] == 'shen') continue;
                                const skills = lib.character[name][3];
                                lib.character[name][2] = 4;
                                lib.character[name][3] = [];
                                lib.character[name][4]?.remove('hiddenSkill');
                                if (skills.length && Math.abs(['junk', 'rare', 'epic', 'legend'].indexOf(game.getRarity(name))) >= lib.config.levelSkills) {
                                    for (const skill of skills) {
                                        if (['huashen', 'rehuashen', 'xinsheng', 'rexinsheng', 'duanchang', 'pingjian', 'dunshi', 'mbdanggu', 'mbmowang'].includes(skill)) continue;
                                        const info = get.info(skill);
                                        if (!info || info.charlotte || (info.unique && !info.gainable) || info.combo || info.juexingji || info.limited || info.zhuSkill || info.hiddenSkill || info.dutySkill || info.seatRelated === 'changeSeat') continue;
                                        game.HuNv_sixieSkills.push(skill);
                                    }
                                }
                            }
                            ui.arena.classList.add('choose-character');
                            let list1 = _status.characterlist.randomGets(10), list2 = list1.randomRemove(5);
                            let createDialog = [lib.config.singleControlx ? '请选择你和队友的形象' : '请选择你的形象'];
                            if (lib.config.singleControlx) createDialog.push('<div class="text center">玩家形象</div>');
                            createDialog.push([list1, 'character']);
                            const fellow = game.players.find(current => current != player && current.identity == player.identity);
                            if (fellow) {
                                fellow.fellow = player;
                                player.fellow = fellow;
                                createDialog.push('<div class="text center">队友形象</div>');
                                createDialog.push([list2, 'character']);
                                if (lib.config.singleControlx) {
                                    game.addGlobalSkill('autoswap');
                                    fellow._trueMe = player;
                                }
                            }
                            const result = await player.chooseButton(createDialog, (lib.config.singleControlx ? 2 : 1), true).set('filterButton', button => {
                                const [list1, list2] = get.event().list;
                                return (!!ui.selected.buttons.length ? list2 : list1).includes(button.link);
                            }).set('onfree', true).set('list', [list1, list2]).forResult();
                            const chooseSkill = async function (player) {
                                const skills = game.HuNv_sixieSkills.filter(skill => !player.hasSkill(skill, null, false, false)).randomGets(3);
                                if (skills.length > 0) {
                                    const result = skills.length > 1 ? await player.chooseControl(skills).set('dialog', (() => {
                                        const dialog = ui.create.dialog('hidden', 'forcebutton');
                                        dialog.addText('选择获得一个初始技能');
                                        for (const skill of skills) {
                                            dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>');
                                        }
                                        dialog.addText(' <br> ');
                                        return dialog;
                                    })()).forResult() : { control: skills[0] };
                                    if (result?.control) await player.addAdditionalSkills('HuNv_sixie', result.control, true);
                                }
                            };
                            player.init(result.links[0]);
                            player.addSkill('HuNv_sixie');
                            if (fellow) {
                                fellow.init(result.links[1] || list2.randomGet());
                                fellow.addSkill('HuNv_sixie');
                            }
                            await chooseSkill(player);
                            if (fellow) await chooseSkill(fellow);
                            if (!ui.giveupSystem && (!fellow || lib.config.singleControlx)) {
                                ui.giveupSystem = ui.create.system('投降', function () {
                                    game.log(game.me, '投降');
                                    game.over(false);
                                }, true);
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    character: (() => {
                        const character = {
                            boss_qingnv1: ['female', 'qun', 3, ['HuNv_duomo', 'HuNv_meihuo']],
                            boss_qingnv2: ['female', 'qun', 4, ['HuNv_duomo', 'HuNv_meihuo', 'HuNv_yushou']],
                            boss_qingnv3: ['female', 'qun', 5, ['HuNv_duomo', 'HuNv_meihuo', 'HuNv_yushou', 'HuNv_qinyun', 'HuNv_duanwei']],
                        };
                        for (const name in character) {
                            character[name][4] ??= [];
                            character[name][4].addArray(['forbidai', `ext:活动萌扩/image/${name}.jpg`]);
                        }
                        return character;
                    })(),
                    skill: {
                        _HuNv_revive: {
                            charlotte: true,
                            superCharlotte: true,
                            ruleSkill: true,
                            trigger: { global: 'phaseAfter' },
                            filter(event, player) {
                                return player == game.HuNv && player.isDead() && (game.players.length == 1 || event.player.getSeatNum() == 2);
                            },
                            forceDie: true,
                            direct: true,
                            lastDo: true,
                            priority: -Infinity,
                            content() {
                                'step 0'
                                player.revive();
                                game.HuNvRound++;
                                game.broadcastAll(function () {
                                    if (ui.LongZhouInfo) ui.LongZhouInfo.innerHTML = '青丘弄琴：第' + get.cnNumber(game.HuNvRound, true) + '回合';
                                });
                                'step 1'
                                player.init('boss_qingnv' + game.HuNvRound);
                                player.directgain(get.cards(4));
                            },
                        },
                        HuNv_sixie: {
                            charlotte: true,
                            superCharlotte: true,
                            trigger: { player: 'phaseZhunbeiBegin' },
                            direct: true,
                            async content(event, trigger, player) {
                                const skills = game.HuNv_sixieSkills.filter(skill => !player.hasSkill(skill, null, false, false)).randomGets(3);
                                if (skills.length > 0) {
                                    const getSkillDialog = function (skills, prompt) {
                                        const dialog = ui.create.dialog('hidden', 'forcebutton');
                                        if (prompt) dialog.addText(prompt);
                                        for (let i = 0; i < skills.length; i++) {
                                            dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                                        }
                                        dialog.addText(' <br> ');
                                        return dialog;
                                    };
                                    const result = await player.chooseControl(skills, 'cancel2').set('ai', () => {
                                        const player = get.player();
                                        if ((player.additionalSkills?.['HuNv_sixie'] ?? []).length === 3) return 'cancel2';
                                        return skills.randomGet();
                                    }).set('dialog', getSkillDialog(skills, '选择获得一个技能')).forResult();
                                    if (result?.control) {
                                        player.logSkill('HuNv_sixie');
                                        await player.addAdditionalSkills('HuNv_sixie', result.control, true);
                                        if ((player.additionalSkills?.['HuNv_sixie'] ?? []).length > 3) {
                                            const result2 = await player.chooseControl(player.additionalSkills['HuNv_sixie']).set('ai', () => {
                                                let controls = get.event().controls.slice();
                                                return controls.sort((a, b) => get.skillRank(a) - get.skillRank(b))[0];
                                            }).set('dialog', getSkillDialog(skills, '选择失去一个技能')).forResult();
                                            if (result2?.control) {
                                                await player.changeSkills([], [result2.control]).set("$handle", (player, addSkills, removeSkills) => {
                                                    for (const skill of removeSkills) player.popup(skill);
                                                    game.log(player, "失去了技能", ...removeSkills.map(i => `#g【${get.translation(i)}】`));
                                                    player.removeSkill(removeSkills);
                                                    const additionalSkills = player.additionalSkills['HuNv_sixie'];
                                                    additionalSkills.removeArray(removeSkills);
                                                    if (!additionalSkills.length) delete player.additionalSkills['HuNv_sixie'];
                                                });
                                            }
                                        }
                                    }
                                }
                            },
                        },
                        HuNv_duomo: {
                            init(player, skill) {
                                player.storage[skill] ??= [0, 0, 0];
                            },
                            mark: true,
                            intro: {
                                markcount: () => undefined,
                                content(storage = [0, 0, 0]) {
                                    return [
                                        '准备阶段摸' + storage[0] + '张牌',
                                        '使用【杀】的次数上限+' + storage[1],
                                        '手牌上限+' + storage[2],
                                    ].map(str => `<li>${str}`).join('<br>');
                                },
                            },
                            mod: {
                                cardUsable(card, player, num) {
                                    if (card.name == 'sha') return num + player.storage.HuNv_duomo[1];
                                },
                                maxHandcard(player, num) {
                                    return num + player.storage.HuNv_duomo[2];
                                },
                            },
                            trigger: { global: 'logSkill', player: ['phaseZhunbeiBegin', 'phaseBegin'] },
                            filter(event, player) {
                                var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                                if (summer >= 15 && event.name != 'phaseZhunbei') return false;
                                if (event.name == 'phase') return true;
                                if (event.name == 'phaseZhunbei') return player.storage.HuNv_duomo[0] > 0;
                                return event.skill == 'HuNv_sixie' && event.player != player;
                            },
                            forced: true,
                            content() {
                                'step 0'
                                if (trigger.name == 'phaseZhunbei') {
                                    player.draw(player.storage.HuNv_duomo[0]);
                                    event.finish();
                                    return;
                                }
                                var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                                player.storage.HuNv_duomo[summer % 3]++;
                                'step 1'
                                var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                                var name = player.name, bool = false;
                                if (name == 'boss_qingnv1' && summer >= 7) bool = true;
                                if (name == 'boss_qingnv2' && summer >= 12) bool = true;
                                if (bool) player.die();
                            },
                        },
                        HuNv_meihuo: {
                            inherit: 'xianzhen',
                            content() {
                                'step 0'
                                player.chooseToCompare(target);
                                'step 1'
                                if (result.bool) {
                                    player.storage.xianzhen = target;
                                    player.addTempSkill('xianzhen2');
                                }
                                else {
                                    player.addTempSkill('xianzhen3');
                                }
                            },
                        },
                        HuNv_yushou: {
                            trigger: { player: 'phaseUseBegin' },
                            filter(event, player) {
                                return player.hasValueTarget({ name: 'nanman', isCard: true });
                            },
                            forced: true,
                            locked: false,
                            content() {
                                player.chooseUseTarget(true, { name: 'nanman', isCard: true });
                            },
                        },
                        HuNv_qinyun: {
                            inherit: 'jijiu',
                        },
                        HuNv_duanwei: {
                            trigger: { player: 'phaseJudgeBegin' },
                            filter(event, player) {
                                return player.countCards('j') && player.countCards('h') > 1;
                            },
                            direct: true,
                            content() {
                                'step 0'
                                player.chooseToDiscard('h', 2, get.prompt2('HuNv_duanwei')).set('ai', function (card) {
                                    return 6 - get.value(card);
                                }).logSkill = 'HuNv_duanwei';
                                'step 1'
                                if (result.bool) {
                                    player.discardPlayerCard(player, 'j', true);
                                }
                            },
                        },
                    },
                    translate: {
                        HuNv: '敌',
                        HuNv2: '狐妖',
                        cai: '盟',
                        cai2: '盟军',
                        boss_qingnv1: '青女',
                        boss_qingnv2: '青女',
                        boss_qingnv3: '九尾狐',
                        HuNv_sixie: '祀邪',
                        HuNv_sixie_info: '准备阶段，你可以从随机三个技能中获得一个技能，然后若你的技能数超过三个，则你须选择失去一个技能。',
                        HuNv_duomo: '堕魔',
                        HuNv_duomo_info: '锁定技，其他角色发动【祀邪】后，或你的回合开始时，你依次获得“准备阶段摸一张牌”/“使用【杀】的次数上限+1”/“手牌上限+1”的效果（每项至多获得5次）。',
                        HuNv_meihuo: '魅惑',
                        HuNv_meihuo_info: '出牌阶段限一次，你可以与一名角色拼点。若你赢，你本回合无视与该角色的距离，无视该角色的防具且对其使用【杀】没有次数限制；若你没赢，你本回合不能使用【杀】。',
                        HuNv_yushou: '驭兽',
                        HuNv_yushou_info: '出牌阶段开始时，你视为使用一张【南蛮入侵】。',
                        HuNv_qinyun: '琴韵',
                        HuNv_qinyun_info: '你的回合外，你可以将一张红色牌当作【桃】使用。',
                        HuNv_duanwei: '断尾',
                        HuNv_duanwei_info: '判定阶段开始时，若你的判定区有牌，则你可以弃置两张手牌，然后弃置你判定区的一张牌。',
                    },
                    element: {
                        player: {
                            logAi() { },
                            getFriends(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                var self = false;
                                if (func === true) {
                                    func = null;
                                    self = true;
                                }
                                return game[method](function (current) {
                                    if (!self && current == player) return false;
                                    return current.identity == identity;
                                }, [], includeOut);
                            },
                            getEnemies(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                return game[method](function (current) {
                                    return current.identity != identity;
                                }, [], includeOut);
                            },
                            isFriendOf(player, includeDie, includeOut) {
                                return this.getFriends(true, includeDie, includeOut).includes(player);
                            },
                            isEnemyOf(player, includeDie, includeOut) {
                                return this.getEnemies(true, includeDie, includeOut).includes(player);
                            },
                            dieAfter() {
                                game.checkResult();
                            },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.character, changeFunction.lib.character);
            Object.assign(lib.skill, changeFunction.lib.skill);
            for (const i in changeFunction.lib.skill) game.finishSkill(i);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            //定义阵容
            const target = game.HuNv = game.players.filter(current => current !== game.me).randomGet();
            game.players.sortBySeat(target.next);
            game.zhu = _status.roundStart = target.next;
            game.players.forEach((i, index) => {
                i.identity = (target == i ? 'HuNv' : 'cai');
                i.setIdentity();
                i.identityShown = true;
                i.setSeatNum(index + 1);
                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                Object.assign(i, changeFunction.lib.element.player);
            });
            game.showIdentity(true);
        },
    },
};
export default brawl;