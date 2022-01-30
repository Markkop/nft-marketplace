// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
// From: https://docs.openzeppelin.com/contracts/4.x/erc20
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MarkToken is ERC20 {
    constructor() ERC20("MARKTOKEN", "MTOKEN") {
        uint256 initialSupply = 1000000 * 10**18; // 1,000,00
        _mint(msg.sender, initialSupply);
    }
}
