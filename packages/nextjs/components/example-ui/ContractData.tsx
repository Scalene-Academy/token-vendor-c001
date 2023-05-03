// import { useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

export const ContractData = () => {
  // const [vendorEvents, setVendorEvents] = useState([]);

  // @TODO: get existing events here!
  // const {
  //   data: eventHistory,
  //   isLoading: isLoadingEventHistory,
  //   error: errorReadingEventHistory,
  // } = useScaffoldEventHistory({
  //   contractName: "YourToken",
  //   eventName: undefined,
  //   fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
  //   blockData: true,
  // });

  // console.log("events history", isLoadingEventHistory, errorReadingEventHistory, eventHistory);

  // @TODO: listen for new events and do something with them here!
  // useScaffoldEventSubscriber({
  //   contractName: "Vendor",
  //   eventName: "BuyTokens",
  //   listener: (buyer, amountOfEth, amountOfTokens) => {
  //     console.log(buyer, amountOfEth, amountOfTokens);
  //   },
  // });

  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className={`flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full`}>
        <div className="text-6xl text-black text-center">🌈 Events 🌈</div>
        <hr />
        <div>{/* @TODO: get creative and display events here! */}I haven&apos;t been implemented...</div>
      </div>
    </div>
  );
};
