pragma solidity 0.4.24;

import 'chainlink/contracts/ChainlinkClient.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DefiScore is ChainlinkClient, Ownable {
    uint256 private constant ORACLE_PAYMENT = 1 * LINK;

    address internal oracle;
    string internal jobId;

    event DefiScore(
        bytes32 indexed requestId,
        uint256 timestamp,
        uint16 openSource,
        uint16 audited,
        uint16 verifyed,
        uint16 safe,
        uint16 score,
        uint16 liquidityIndex,
        uint16 collateralIndex
    );

    constructor(address _oracle, string _jobId) public Ownable() {
        setPublicChainlinkToken();
        oracle = _oracle;
        jobId = _jobId;
    }

    function requestDefiScore(string _protocol, string _asset) public {
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(jobId),
            this,
            this.fulfillScore.selector
        );
        req.add('protocol', _protocol);
        req.add('asset', _asset);
        sendChainlinkRequestTo(oracle, req, ORACLE_PAYMENT);
    }

    function fulfillScore(bytes32 _requestId, bytes32 _data)
        public
        recordChainlinkFulfillment(_requestId)
    {
        (
            uint16 openSource,
            uint16 audited,
            uint16 verifyed,
            uint16 safe,
            uint16 score,
            uint16 liquidityIndex,
            uint16 collateralIndex
        ) = unpack16(_data);

        emit DefiScore(
            _requestId,
            block.timestamp,
            openSource,
            audited,
            verifyed,
            safe,
            score,
            liquidityIndex,
            collateralIndex
        );
    }

    function unpack16 (bytes32 _data)
    public
    view
    returns (
            uint16 openSource,
            uint16 audited,
            uint16 verifyed,
            uint16 safe,
            uint16 score,
            uint16 liquidityIndex,
            uint16 collateralIndex
        )
    {
        collateralIndex = uint16 (bytes2 (_data << (144+96)));
        liquidityIndex = uint16 (bytes2 (_data << (144+80)));
        score = uint16 (bytes2 (_data << (144+64)));
        safe = uint16 (bytes2 (_data << (144+48)));
        verifyed = uint16 (bytes2 (_data << (144+32)));
        audited = uint16 (bytes2 (_data << (144 + 16)));
        openSource = uint16 (bytes2 (_data << 144));
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            'Unable to transfer'
        );
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) public onlyOwner {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

}
