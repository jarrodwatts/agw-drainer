// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721Enumerable, Ownable {
    uint256 private _tokenIds;

    constructor() ERC721("Test NFT", "TNFT") Ownable(msg.sender) {}

    function mint(address to) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(to, newItemId);
        return newItemId;
    }

    function mintBatch(address to, uint256 amount) public {
        for (uint256 i = 0; i < amount; i++) {
            _tokenIds++;
            _mint(to, _tokenIds);
        }
    }

    // Required override for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override(ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // Required override for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}