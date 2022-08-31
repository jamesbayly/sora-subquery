import { SubstrateExtrinsic } from "@subql/types";
import { formatU128ToBalance, assignCommonHistoryElemInfo, updateHistoryElementAccounts } from "./utils";
import { XOR } from "..";

export async function referralUnreserveHandler(extrinsic: SubstrateExtrinsic): Promise<void> {
    logger.debug("Caught referral unreserve extrinsic");

    const record = assignCommonHistoryElemInfo(extrinsic);

    let details = new Object();

    if (record.execution.success) {
        let referralUnreserveEvent = extrinsic.events.find(e => e.event.method === 'Transfer' && e.event.section === 'balances');
        const { event: { data: [from, to, amount] } } = referralUnreserveEvent;

        details = {
            from: from.toString(),
            to: to.toString(),
            amount: formatU128ToBalance(amount.toString(), XOR)
        }
    } else {
        const { extrinsic: { args: [amount] } } = extrinsic;

        details = {
            amount: formatU128ToBalance(amount.toString(), XOR)
        }
    }

    record.data = details

    await record.save();
    await updateHistoryElementAccounts(record);

    logger.debug(`===== Saved referral unreserve with ${extrinsic.extrinsic.hash.toString()} txid =====`);
}
