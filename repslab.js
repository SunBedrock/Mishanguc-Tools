importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.math);
importPackage(Packages.com.sk89q.worldedit.blocks);
importPackage(Packages.com.sk89q.worldedit.session);
importPackage(Packages.com.sk89q.worldedit.regions);
importPackage(Packages.com.sk89q.worldedit.extent.clipboard);
importPackage(Packages.com.sk89q.worldedit.extent.clipboard.io);
importPackage(Packages.com.sk89q.worldedit.function.operation);

var session = context.getSession();
var player = context.getPlayer();
var blocks = context.remember();

var selection = session.getSelection(player.getWorld());

var clipboard = new BlockArrayClipboard(selection);
var clipboardHolder = new ClipboardHolder(clipboard);

var worldEdit = Packages.com.sk89q.worldedit.WorldEdit.getInstance();
var editSession = worldEdit.newEditSession(player.getWorld());


var forwardExtentCopy = new ForwardExtentCopy(
    editSession,
    selection,
    clipboard,
    selection.getMinimumPoint()
);
forwardExtentCopy.setCopyingEntities(false);
forwardExtentCopy.setCopyingBiomes(false);

Operations.complete(forwardExtentCopy);

var clipboard = clipboardHolder.getClipboard();
var region = clipboard.getRegion();
var minP = region.getMinimumPoint();
var maxP = region.getMaximumPoint();

var firstSecondCount = 0;
var onlyThird = false;

if (argv && argv.length > 1 && argv[1] == "-r") {
    onlyThird = true;
}

if (!onlyThird) {
    var bottomLayerFound = false;
    var bottomLayerY = -1;
    for (var y = maxP.getY(); y >= minP.getY(); y--) {
        var foundBottom = false;
        for (var x = minP.getX(); x <= maxP.getX(); x++) {
            for (var z = minP.getZ(); z <= maxP.getZ(); z++) {
                var pos = BlockVector3.at(x, y, z);
                if (region.contains(pos)) {
                    var block = clipboard.getBlock(pos);
                    var blockStr = block.toString();
                    if (/\[type=bottom(,.*?)?\]/.test(blockStr)) {
                        foundBottom = true;
                        break;
                    }
                }
            }
            if (foundBottom) break;
        }
        if (foundBottom) {
            bottomLayerFound = true;
            bottomLayerY = y;
            for (var x = minP.getX(); x <= maxP.getX(); x++) {
                for (var z = minP.getZ(); z <= maxP.getZ(); z++) {
                    var pos = BlockVector3.at(x, y, z);
                    if (region.contains(pos)) {
                        var block = clipboard.getBlock(pos);
                        var blockStr = block.toString();
if (/\[type=bottom(,.*?)?\]/.test(blockStr)) {
    var Pattern = java.util.regex.Pattern;
    var pattern = Pattern.compile("\\[type=bottom(,.*?)?\\]");
    var Matcher = java.util.regex.Matcher;
    var matcher = pattern.matcher(blockStr);
    var newBlockStr = matcher.replaceAll("[type=double]");
    var newBlock = context.getBlock(newBlockStr);
    if (newBlock && !newBlock.equals(block)) {
        clipboard.setBlock(pos, newBlock);
        firstSecondCount++;
    }
} else {
    var airBlock = context.getBlock("minecraft:air");
    if (airBlock && !airBlock.equals(block)) {
        clipboard.setBlock(pos, airBlock);
        firstSecondCount++;
    }
}
                    }
                }
            }
            break;
        }
    }
    if (bottomLayerFound) {
        for (var y = maxP.getY(); y >= minP.getY(); y--) {
            if (y == bottomLayerY) continue;
            for (var x = minP.getX(); x <= maxP.getX(); x++) {
                for (var z = minP.getZ(); z <= maxP.getZ(); z++) {
                    var pos = BlockVector3.at(x, y, z);
                    if (region.contains(pos)) {
                        var block = clipboard.getBlock(pos);
                        var airBlock = context.getBlock("minecraft:air");
                        if (airBlock && !airBlock.equals(block)) {
                            clipboard.setBlock(pos, airBlock);
                            firstSecondCount++;
                        }
                    }
                }
            }
        }
    }
}

var minPoint = selection.getMinimumPoint();
var maxPoint = selection.getMaximumPoint();
var offsetVec = minPoint.toVector3().add(0, -1, 0);
var offset = offsetVec.subtract(clipboard.getOrigin().toVector3());
if (!onlyThird) {
    for (var x = minP.getX(); x <= maxP.getX(); x++) {
        for (var y = minP.getY(); y <= maxP.getY(); y++) {
            for (var z = minP.getZ(); z <= maxP.getZ(); z++) {
                var pos = BlockVector3.at(x, y, z);
                if (region.contains(pos)) {
                    var block = clipboard.getBlock(pos);
                    if (block.toString() != "minecraft:air" && !/\[type=bottom(,.*?)?\]/.test(block.toString())) {
                        blocks.setBlock(BlockVector3.at(
                            x + offset.getX(),
                            y + offset.getY(),
                            z + offset.getZ()
                        ), block);
                    }
                }
            }
        }
    }
}

var secondCount = 0;
if (!onlyThird) {
    for (var y = maxPoint.getY(); y >= minPoint.getY(); y--) {
        var foundBottom = false;
        for (var x = minPoint.getX(); x <= maxPoint.getX(); x++) {
            for (var z = minPoint.getZ(); z <= maxPoint.getZ(); z++) {
                var pos = BlockVector3.at(x, y, z);
                if (selection.contains(pos)) {
                    var block = blocks.getBlock(pos);
                    var blockStr = block.toString();
                    if (/\[type=bottom(,.*?)?\]/.test(blockStr)) {
                        foundBottom = true;
                        break;
                    }
                }
            }
            if (foundBottom) break;
        }
        if (foundBottom) {
            for (var x = minPoint.getX(); x <= maxPoint.getX(); x++) {
                for (var z = minPoint.getZ(); z <= maxPoint.getZ(); z++) {
                    var pos = BlockVector3.at(x, y, z);
                    if (selection.contains(pos)) {
                        var block = blocks.getBlock(pos);
                        var blockStr = block.toString();
                        if (/\[type=bottom(,.*?)?\]/.test(blockStr)) {
                            blocks.setBlock(pos, context.getBlock("minecraft:air"));
                            secondCount++;
                        }
                    }
                }
            }
            break;
        }
    }
}
var thirdCount = 0;
for (var y = maxPoint.getY(); y >= minPoint.getY(); y--) {
    var foundMishanguc = false;
    for (var x = minPoint.getX(); x <= maxPoint.getX(); x++) {
        for (var z = minPoint.getZ(); z <= maxPoint.getZ(); z++) {
            var pos = BlockVector3.at(x, y, z);
            if (selection.contains(pos)) {
                var block = blocks.getBlock(pos);
                var blockStr = block.toString();
                if (blockStr.startsWith("mishanguc:")) {
                    foundMishanguc = true;
                    break;
                }
            }
        }
        if (foundMishanguc) break;
    }
    if (foundMishanguc) {
        for (var x = minPoint.getX(); x <= maxPoint.getX(); x++) {
            for (var z = minPoint.getZ(); z <= maxPoint.getZ(); z++) {
                var pos = BlockVector3.at(x, y, z);
                if (selection.contains(pos)) {
                    var block = blocks.getBlock(pos);
                    var blockStr = block.toString();
                    if (blockStr.indexOf("mishanguc:road_block") !== -1) {
                        var newBlock = context.getBlock("mishanguc:road_slab");
                        if (newBlock) {
                            blocks.setBlock(pos, newBlock);
                            thirdCount++;
                        }
                    } else if (blockStr.startsWith("mishanguc:road_with")) {
                        var suffix = blockStr.substring("mishanguc:road_with".length);
                        var newBlockStr = "mishanguc:road_slab_with" + suffix;
                        var newBlock = context.getBlock(newBlockStr);
                        if (newBlock && newBlock.toString() !== "minecraft:air") {
                            blocks.setBlock(pos, newBlock);
                            thirdCount++;
                        }
                    }
                }
            }
        }
        break;
    }
}


if (onlyThird) {
    player.print("仅替换了 " + thirdCount + " 个道路方块");
} else {
    player.print("替换了 " + (secondCount) + " 个台阶方块，" + thirdCount + " 个道路方块");
}
