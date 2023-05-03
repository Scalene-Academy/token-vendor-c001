import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";

type ContractInteractionCardProps = {
  label: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onClick: () => Promise<void>;
  buttonIsLoading: boolean;
  subtitleLabel: string;
  subtitleValue: string;
};

export const ContractInteractionCard: React.FC<ContractInteractionCardProps> = ({
  label,
  setValue,
  onClick,
  buttonIsLoading,
  subtitleLabel,
  subtitleValue,
}) => {
  return (
    <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
      <span className="text-4xl sm:text-6xl text-black">{label}</span>

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
        <input
          type="text"
          className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
          onChange={e => setValue(e.target.value)}
        />
        <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
          <div className="flex rounded-full border-2 border-primary p-1">
            <button
              className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                buttonIsLoading ? "loading" : ""
              }`}
              onClick={onClick}
            >
              {!buttonIsLoading && (
                <>
                  Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 items-start">
        <span className="text-sm leading-tight">{subtitleLabel}:</span>
        <div className="badge badge-warning">{subtitleValue}</div>
      </div>
    </div>
  );
};
