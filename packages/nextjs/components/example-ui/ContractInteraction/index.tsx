import { useState } from "react";
import { CopyIcon } from "../assets/CopyIcon";
import { DiamondIcon } from "../assets/DiamondIcon";
import { HareIcon } from "../assets/HareIcon";
import { ContractInteractionCard } from "./ContractInteractionCard";
import { ethers } from "ethers";
import { XMarkIcon } from "@heroicons/react/24/outline";
// import eth price hook here
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const [visible, setVisible] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  const vendor = useDeployedContractInfo("Vendor");

  // approve, sell, buy

  const { writeAsync: buyTokensAsync, isLoading: buyTokensIsLoading } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "buyTokens",
    value: buyAmount,
  });

  const { writeAsync: approveAsync, isLoading: approveIsLoading } = useScaffoldContractWrite({
    contractName: "YourToken",
    functionName: "approve",
    args: [vendor.data?.address, ethers.utils.parseEther(approveAmount || "1")],
  });

  const { writeAsync: sellTokensAsync, isLoading: sellIsLoading } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "sellTokens",
    args: [ethers.utils.parseEther(sellAmount || "1")],
  });

  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />

      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
          <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                In this page you can see how some of our <strong>hooks & components</strong> work, and how you can bring
                them to life with your own design! Have fun and try it out!
              </div>
              <div className="mt-2">
                Check out{" "}
                <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem]">
                  packages / nextjs/pages / example-ui.tsx
                </code>{" "}
                and its underlying components.
              </div>
            </div>
          </div>
          <button
            className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 bg-opacity-80 z-0 min-h-0 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <ContractInteractionCard
          label="Buy Tokens"
          setValue={setBuyAmount}
          onClick={buyTokensAsync}
          buttonIsLoading={buyTokensIsLoading}
        />

        <ContractInteractionCard
          label="Approve"
          setValue={setApproveAmount}
          onClick={approveAsync}
          buttonIsLoading={approveIsLoading}
        />

        <ContractInteractionCard
          label="Sell Tokens"
          setValue={setSellAmount}
          onClick={sellTokensAsync}
          buttonIsLoading={sellIsLoading}
        />
      </div>
    </div>
  );
};
