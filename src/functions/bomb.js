const readline = require("readline");
function readInput() {
  const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) =>
    interface.question("", (answer) => {
      interface.close();
      resolve(answer);
    })
  );
}

class Node {
  left = null;
  right = null;
  tool = null;
}

async function generateDefuseKitTree(toolCount) {
  const stack = [];
  let assignedToolsCount = 0;
  const mockedMovement = [1, 3, 2, 3, 2, 1];

  // Immediately assign a tool for root node
  const rootNode = new Node();
  rootNode.tool = assignTool();
  assignedToolsCount = 1;
  stack.push(rootNode);

  console.log(rootNode);

  while (toolCount !== assignedToolsCount) {
    /**
     * Generates randomly a movement for movementMap[]
     * Legend:
     * 		0: Root placed
     * 		1: Left
     * 		2: Right
     * 		3: Back to previous node
     *
     * Note: 0 is not included in random generation, as it was already initialized
     */

    await readInput();

    // const movement = Math.floor(Math.random() * 3 + 1);
    const movement = mockedMovement.shift();

    const isLeftOfRecentNodePopulated = stack[stack.length - 1].left !== null;
    const isRightOfRecentNodePopulated = stack[stack.length - 1].right !== null;
    const isStackContainsRootOnly = stack.length === 1;

    const recentNode = stack[stack.length - 1];

    console.log(movement);

    if (movement === 1 && !isLeftOfRecentNodePopulated) {
      console.log("Accepted 1");
      const newNode = new Node();
      newNode.tool = assignTool();
      recentNode.left = newNode;
      stack.push(newNode);
      assignedToolsCount += 1;
    }

    if (movement === 2 && !isRightOfRecentNodePopulated) {
      console.log("Accepted 2");
      const newNode = new Node();
      newNode.tool = assignTool();
      recentNode.right = newNode;
      stack.push(newNode);
      assignedToolsCount += 1;
    }

    if (movement === 3 && isStackContainsRootOnly) {
      console.log("Skipped/Continued.");
      continue;
    }

    const copy = [...stack];
    copy.pop(); // Remove the recent node
    const previousNode = copy.pop(); // Get the to be backtracked node.

    if (movement === 3 && previousNode.left !== null && previousNode.right !== null) {
      console.log("Backtrack blocked! Node children are populated.", previousNode);
      continue;
    }

    if (movement === 3 && !isStackContainsRootOnly) {
      console.log("Accepted 3");
      stack.pop();
    }

    console.log(stack[stack.length - 1]);
    console.log("Assigned Tools:", assignedToolsCount);
  }

  return rootNode;
}

function assignTool() {
  const toolsList = [
    "bomb suit",
    "x-ray",
    "disruptor",
    "bolt cutter",
    "wire cutter",
    "flashlight",
    "screwdriver"
  ];

  return toolsList[Math.floor(Math.random() * toolsList.length)];
}

async function start() {
  const generated = await generateDefuseKitTree(5);
  console.log(generated.left);
  console.log(generated.left.left); // null
  console.log(generated.left.right); // null

  console.log(generated.right);
  console.log(generated.right.left); // null
  console.log(generated.right.right);
  console.log(generated.right.right.left);
  console.log(generated.right.right.right); // null
}

start();
