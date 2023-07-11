class Node {
  left = null;
  right = null;
  tool = null;
}

/**
 * @param {number} toolCount - number of tools shall the tree generate
 *
 * This loop generates a random tree, where each node is a tool for defusing a bomb
 * During generation, it uses a randomize legend for a cursor's movement.
 * The cursor will determine where the node will be placed in a tree.
 *
 * Cursor Legend:
 * 		0: Assign a Root
 * 		1: Assign to Left Child
 * 		2: Assign to Right Child
 * 		3: Backtrack to previous node
 *
 * The legend 3, may forbid backtracking, iff:
 * 		A. The children of the node to be backtracked are already populated
 *
 * Note: 0 is not included in random generation (Math.random),
 * as it was already initialized for the root node.
 *
 * @returns {Node}
 */

export function generateDefuseKitTree(toolCount) {
  const stack = [];
  let assignedToolsCount = 0;

  // Immediately assign a tool for the root node

  const rootNode = new Node();
  rootNode.tool = assignTool();
  stack.push(rootNode);
  assignedToolsCount = 1;
  console.log(rootNode.tool, "is assigned to left child of root node.");
  console.log("Assigned Tools:", assignedToolsCount);

  while (toolCount !== assignedToolsCount) {
    console.log("=================================");
    const movement = Math.floor(Math.random() * 3 + 1);
    const recentNode = stack[stack.length - 1];
    console.log("Movement: ", movement);
    const isLeftOfRecentNodePopulated = recentNode.left !== null;
    const isRightOfRecentNodePopulated = recentNode.right !== null;
    const isStackContainsRootOnly = stack.length === 1;

    // Assign to left child of the most recent tree, if it is not populated

    if (movement === 1 && !isLeftOfRecentNodePopulated) {
      const newNode = new Node();
      newNode.tool = assignTool();
      recentNode.left = newNode;
      stack.push(newNode);
      console.log(recentNode.left.tool, "is assigned to left child of new node.");
      assignedToolsCount += 1;
    }

    // Assign to right child of the most recent tree, if it is not populated

    if (movement === 2 && !isRightOfRecentNodePopulated) {
      const newNode = new Node();
      newNode.tool = assignTool();
      recentNode.right = newNode;
      stack.push(newNode);
      console.log(recentNode.right.tool, "is assigned to right child of new node.");
      assignedToolsCount += 1;
    }

    // Skip iteration if the cursor is on the root node and it still want to backtrack

    if (movement === 3 && isStackContainsRootOnly) {
      console.log("Skipped backtracking as stack contains root only.");
      continue;
    }

    const stackCopy = [...stack];
    stackCopy.pop(); // Remove the recent node
    const previousNode = stackCopy.pop(); // Get the node to be backtracked.

    // Check if the children of the node to be backtracked are already occupied.

    if (movement === 3 && previousNode.left !== null && previousNode.right !== null) {
      console.log("Backtrack blocked! Node children are populated.");
      continue;
    }

    if (movement === 3 && !isStackContainsRootOnly) {
      console.log("Backtracked.");
      stack.pop();
    }

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

export function getAllToolsFromTree(root) {
  const tools = [];

  function traverse(node) {
    if (node === null) {
      return;
    }

    tools.push(node.tool);
    traverse(node.left);
    traverse(node.right);
  }

  traverse(root);
  return tools;
}
