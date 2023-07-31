// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LinToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("LinToken", "LETH") {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;  
    }
}