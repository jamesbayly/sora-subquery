import { SubstrateExtrinsic } from "@subql/types";
import { formatU128ToBalance, assignCommonHistoryElemInfo } from "./utils";

export async function referralReserveHandler(extrinsic: SubstrateExtrinsic): Promise<void> {
	logger.debug("Caught referral unreserve extrinsic");

    const record = assignCommonHistoryElemInfo(extrinsic);

    let details = new Object();

	if (record.execution.success) {
        let referralUnreserveEvent = extrinsic.events.find(e => e.event.method === 'Transferred' && e.event.section === 'currencies');
        const { event: { data: [, from, to, amount] } } = referralUnreserveEvent;

        details = {
            from: from.toString(),
            to: to.toString(),
            amount: formatU128ToBalance(amount.toString())
        }
    } else {
        const { extrinsic: { args: [amount] } } = extrinsic;
        
        details = {
            amount: formatU128ToBalance(amount.toString())
        }
    }

    record.data = details

    await record.save();

    logger.debug(`===== Saved referral unreserve with ${extrinsic.extrinsic.hash.toString()} txid =====`);
}
