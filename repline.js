importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.math);
importPackage(Packages.com.sk89q.worldedit.blocks);

var blocks = context.remember();
var player = context.getPlayer();

if (argv[1] == undefined) {
    player.printError("请输入参数")
}
else if (argv[1] == "w" || argv[1] == "wt" || argv[1] == "wo" || argv[1] == "y" || argv[1] == "yd" || argv[1] == "yo") {


    function isLineEndPoint(pos) {
        var block = blocks.getBlock(pos);
        if (!block) return false;
        var blockName = String(block).split("[")[0];

        function isSameLineBlock(p) {
            var b = blocks.getBlock(p);
            if (!b) return false;
            var name = String(b).split("[")[0];
            return name === blockName;
        }

        var directions = [
            BlockVector3.at(1, 0, 0),
            BlockVector3.at(-1, 0, 0),
            BlockVector3.at(0, 0, 1),
            BlockVector3.at(0, 0, -1),
            BlockVector3.at(0, 1, 0),
            BlockVector3.at(0, -1, 0),
            BlockVector3.at(1, 1, 0),
            BlockVector3.at(-1, 1, 0),
            BlockVector3.at(0, 1, 1),
            BlockVector3.at(0, 1, -1),
            BlockVector3.at(1, -1, 0),
            BlockVector3.at(-1, -1, 0),
            BlockVector3.at(0, -1, 1),
            BlockVector3.at(0, -1, -1)
        ];

        var connectedCount = 0;

        for (var i = 0; i < directions.length; i++) {
            var adjacentPos = pos.add(directions[i]);
            if (isSameLineBlock(adjacentPos)) {
                connectedCount++;
            }
        }
        return connectedCount <= 1;
    }


    function lineDirectionWithCorners(origin, distance) {
        var block = blocks.getBlock(origin);
        var line_block_type = String(block).split("[")[0];
        var lines = [];
        var lines_string = [];

        var is_online = function (o, dir) {
            var pos = o.add(dir);
            if (lines_string.indexOf(String(pos)) != -1) return false;
            var block = blocks.getBlock(pos);
            if (!block) return false;
            var blockName = String(block).split("[")[0];
            if (blockName === "minecraft:air") return false;
            return blockName == line_block_type;
        }

        var dir = BlockVector3.at(1, 0, 0);
        if (String(blocks.getBlock(origin.subtract(dir))).split("[")[0] == line_block_type) {
            dir = BlockVector3.at(-1, 0, 0);
        }

        var dx = dir.getX(), dz = dir.getZ();
        var up = BlockVector3.at(0, 1, 0);
        var down = BlockVector3.at(0, -1, 0);

        for (var i = 0; i < distance; i++) {
            var facing = dx == -1 ? "north" : dx == 1 ? "south" : dz == 1 ? "west" : dz == -1 ? "east" : "";
            var cornerType = "";

            var left = BlockVector3.at(dz, 0, -dx);
            var right = BlockVector3.at(-dz, 0, dx);
            var straight = BlockVector3.at(dx, 0, dz);

            var leftConnected = is_online(origin, left) || is_online(origin, left.add(up)) || is_online(origin, left.add(down));
            var rightConnected = is_online(origin, right) || is_online(origin, right.add(up)) || is_online(origin, right.add(down));

            if (leftConnected && !rightConnected) {
                cornerType = "inner";
            } else if (!leftConnected && rightConnected) {
                cornerType = "outer";
            }

            var facing_str = facing;

            lines.push({ pos: origin, facing: facing_str, cornerType: cornerType });
            lines_string.push(String(origin));

            var nextDir = null;

            if (is_online(origin, left.add(up))) {
                nextDir = left.add(up);
            } else if (is_online(origin, left)) {
                nextDir = left;
            } else if (is_online(origin, left.add(down))) {
                nextDir = left.add(down);
            } else if (is_online(origin, straight.add(up))) {
                nextDir = straight.add(up);
            } else if (is_online(origin, straight)) {
                nextDir = straight;
            } else if (is_online(origin, straight.add(down))) {
                nextDir = straight.add(down);
            } else if (is_online(origin, right.add(up))) {
                nextDir = right.add(up);
            } else if (is_online(origin, right)) {
                nextDir = right;
            } else if (is_online(origin, right.add(down))) {
                nextDir = right.add(down);
            } else {
                break;
            }

            dx = nextDir.getX();
            dz = nextDir.getZ();

            origin = origin.add(nextDir);
        }
        return lines;
    }

    function replaceFacingBlocks(origin, distance) {
        if (argv[1] == "wo") {
            var outerBlockBase = "mishanguc:road_with_white_offset_out_ba_line";
            var innerBlockBase = "mishanguc:road_with_white_offset_in_ba_line";
            var defaultBlockBase = "mishanguc:road_with_white_offset_line";
        } else if (argv[1] == "yo") {
            var outerBlockBase = "mishanguc:road_with_yellow_offset_out_ba_line";
            var innerBlockBase = "mishanguc:road_with_yellow_offset_in_ba_line";
            var defaultBlockBase = "mishanguc:road_with_yellow_offset_line";
        } else if (argv[1] == "w") {
            var outerBlockBase = "mishanguc:road_with_white_ba_line";
            var innerBlockBase = outerBlockBase;
            var defaultBlockBaseAxis = "mishanguc:road_with_white_line";
        } else if (argv[1] == "wt") {
            var outerBlockBase = "mishanguc:road_with_white_ba_thick_line";
            var innerBlockBase = outerBlockBase;
            var defaultBlockBaseAxis = "mishanguc:road_with_white_thick_line";
        } else if (argv[1] == "y") {
            var outerBlockBase = "mishanguc:road_with_yellow_ba_line";
            var innerBlockBase = outerBlockBase;
            var defaultBlockBaseAxis = "mishanguc:road_with_yellow_line";
        } else if (argv[1] == "yd") {
            var outerBlockBase = "mishanguc:road_with_yellow_ba_double_line";
            var innerBlockBase = outerBlockBase;
            var defaultBlockBaseAxis = "mishanguc:road_with_yellow_double_line";
        }

        var lines = lineDirectionWithCorners(origin, distance);

        if (lines.length >= distance) {
            player.print("线段长度已达到最大距离: " + distance);
        }

        var replacedCount = 0;

        for (var i = 0; i < lines.length; i++) {
            var info = lines[i];
            var pos = info.pos;
            var facing = info.facing;
            var newBlockStr = "";
            if (info.cornerType === "") {
                if (defaultBlockBaseAxis) {
                    var axis = (facing === "north" || facing === "south") ? "x" : "z";
                    newBlockStr = defaultBlockBaseAxis + "[axis=" + axis + "]";
                }
                else { newBlockStr = defaultBlockBase + "[facing=" + facing + "]"; }
            } else if (info.facing === "north" && info.cornerType === "outer") {
                newBlockStr = outerBlockBase + "[facing=north_east]";
            } else if (info.facing === "east" && info.cornerType === "inner") {
                newBlockStr = innerBlockBase + "[facing=south_west]";
            } else if (info.facing === "east" && info.cornerType === "outer") {
                newBlockStr = outerBlockBase + "[facing=south_east]";
            } else if (info.facing === "south" && info.cornerType === "inner") {
                newBlockStr = innerBlockBase + "[facing=north_west]";
            } else if (info.facing === "south" && info.cornerType === "outer") {
                newBlockStr = outerBlockBase + "[facing=south_west]";
            } else if (info.facing === "west" && info.cornerType === "inner") {
                newBlockStr = innerBlockBase + "[facing=north_east]";
            } else if (info.facing === "west" && info.cornerType === "outer") {
                newBlockStr = outerBlockBase + "[facing=north_west]";
            } else if (info.facing === "north" && info.cornerType === "inner") {
                newBlockStr = innerBlockBase + "[facing=south_east]";
            } else {
                continue;
            }

            var newBlock = context.getBlock(newBlockStr);
            if (newBlock) {
                blocks.setBlock(pos, newBlock);
                replacedCount++;
            } else {
                player.print("无法找到方块类型: " + newBlockStr);
            }
        }

        player.print("已替换方块数量: " + replacedCount);
    }

    var startPos = player.getBlockOn().toVector().toBlockPoint();

    if (isLineEndPoint(startPos)) {
        replaceFacingBlocks(startPos, 10000);
    } else {
        player.printError("这不是线的端点");
    }
} else {
    player.printError("错误参数：" + argv[1]);
    player.printError("仅支持：单白线w 白粗线wt 偏移白线wo 单黄线y 双黄线yd 偏移黄线yo");
}