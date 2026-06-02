import { resolveEffectiveChannelItem } from "@/lib/menu/universal-menu-builders";
import type {
  ChannelPushOutcome,
  MenuChannel,
  UniversalMenuMaster,
} from "@/lib/menu/universal-menu-types";
import { runChannelMenuSync } from "@/services/menu/sync";

export async function pushMenuItemToChannel(input: {
  userId: string;
  productId: string;
  channel: MenuChannel;
  master: UniversalMenuMaster;
  effective: import("@/lib/menu/universal-menu-types").EffectiveChannelItem;
  previousMaster: UniversalMenuMaster;
}): Promise<ChannelPushOutcome> {
  return runChannelMenuSync(input.channel, {
    userId: input.userId,
    productId: input.productId,
    effective: input.effective,
    previousMaster: input.previousMaster,
  });
}

export async function pushMenuItemToAllChannels(input: {
  userId: string;
  productId: string;
  master: UniversalMenuMaster;
  previousMaster: UniversalMenuMaster;
  channelOverrides: Partial<Record<MenuChannel, import("@/lib/menu/universal-menu-types").ChannelItemOverride>>;
  channels?: MenuChannel[];
}): Promise<ChannelPushOutcome[]> {
  const { MENU_CHANNELS } = await import("@/lib/menu/universal-menu-types");
  const targets = input.channels ?? [...MENU_CHANNELS];

  const outcomes: ChannelPushOutcome[] = [];
  for (const channel of targets) {
    const effective = resolveEffectiveChannelItem(
      input.master,
      channel,
      input.channelOverrides[channel] ?? {},
    );
    const outcome = await pushMenuItemToChannel({
      userId: input.userId,
      productId: input.productId,
      channel,
      master: input.master,
      effective,
      previousMaster: input.previousMaster,
    });
    outcomes.push(outcome);
  }

  return outcomes;
}
