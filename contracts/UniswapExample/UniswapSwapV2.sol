    // SPDX-License-Identifier: UNLICENCED
    pragma solidity ^0.8.0;
    pragma abicoder v2;

    import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
    import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

    interface IUniswapRouter is ISwapRouter {
        function refundETH() external payable;
    }

    contract Uniswap3 {
      IUniswapRouter public constant uniswapRouter = IUniswapRouter(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
      IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
      address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
      address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

      function convertExactEthToDai() external payable {
        require(msg.value > 0, "Must pass non 0 ETH amount");

        uint256 deadline = block.timestamp + 15;
        address tokenIn = WETH9;
        address tokenOut = DAI;
        uint24 fee = 3000;
        address recipient = msg.sender;
        uint256 amountIn = msg.value;
        uint256 amountOutMinimum = 1;
        uint160 sqrtPriceLimitX96 = 0;
        
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
            tokenIn,
            tokenOut,
            fee,
            recipient,
            deadline,
            amountIn,
            amountOutMinimum,
            sqrtPriceLimitX96
        );
        
        uniswapRouter.exactInputSingle{ value: msg.value }(params);
        uniswapRouter.refundETH();
        
        // refund leftover ETH to user
        (bool success,) = msg.sender.call{ value: address(this).balance }("");
        require(success, "refund failed");
      }
      
      function convertEthToExactDai(uint256 daiAmount) external payable {
        require(daiAmount > 0, "Must pass non 0 DAI amount");
        require(msg.value > 0, "Must pass non 0 ETH amount");
          
        uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address tokenIn = WETH9;
        address tokenOut = DAI;
        uint24 fee = 3000;
        address recipient = msg.sender;
        uint256 amountOut = daiAmount;
        uint256 amountInMaximum = msg.value;
        uint160 sqrtPriceLimitX96 = 0;

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams(
            tokenIn,
            tokenOut,
            fee,
            recipient,
            deadline,
            amountOut,
            amountInMaximum,
            sqrtPriceLimitX96
        );

        uniswapRouter.exactOutputSingle{ value: msg.value }(params);
        uniswapRouter.refundETH();

        // refund leftover ETH to user
        (bool success,) = msg.sender.call{ value: address(this).balance }("");
        require(success, "refund failed");
      }
      
      // do not used on-chain, gas inefficient!
      function getEstimatedETHforDAI(uint daiAmount) external payable returns (uint256) {
        address tokenIn = WETH9;
        address tokenOut = DAI;
        uint24 fee = 10000;
        uint160 sqrtPriceLimitX96 = 0;

        return quoter.quoteExactOutputSingle(
            tokenIn,
            tokenOut,
            fee,
            daiAmount,
            sqrtPriceLimitX96
        );
      }
      
      // important to receive ETH
      receive() payable external {}
    }