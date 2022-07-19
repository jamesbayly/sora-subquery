import { SubstrateExtrinsic } from "@subql/types";
import { formatU128ToBalance, assignCommonHistoryElemInfo } from "./utils";
import { assetPrecisions, getAssetId } from "./utils";

export async function assetRegistrationHandler(extrinsic: SubstrateExtrinsic): Promise<void> {

    logger.debug("Caught asset registration extrinsic")

    const record = assignCommonHistoryElemInfo(extrinsic)

    let details = new Object();

    if (record.execution.success) {

        let assetRegistrationEvent = extrinsic.events.find(e => e.event.method === 'AssetRegistered');
        const { event: { data: [asset] } } = assetRegistrationEvent;

        let assetId: string = getAssetId(asset);

        details = {
            assetId: assetId
        }

        if (!assetPrecisions.has(assetId)) {
            const [, , precision,] = await api.query.assets.assetInfos(assetId) as any;
            assetPrecisions.set(assetId, precision.toNumber());
        }

    }

    else {

        const { extrinsic: { args: [symbol, ,] } } = extrinsic;

        details = {
            assetId: symbol.toHuman()
        }

    }

    record.data = details

    await record.save();

    logger.debug(`===== Saved asset registration with ${extrinsic.extrinsic.hash.toString()} txid =====`);

}