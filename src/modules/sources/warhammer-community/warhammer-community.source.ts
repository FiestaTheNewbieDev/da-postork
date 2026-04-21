import { SourceId } from '@entities/subscription.entity';
import { Injectable } from '@nestjs/common';
import { Source } from '@sources/core/abstract-source';
import * as Constants from '@sources/warhammer-community/warhammer-community.constants';

@Injectable()
export class WarhammerCommunitySource extends Source {
  public readonly id = SourceId.WarhammerCommunity;
  public readonly label = Constants.WARHAMMER_COMMUNITY_LABEL;
  public readonly description = Constants.WARHAMMER_COMMUNITY_DESCRIPTION;
  public readonly url = Constants.WARHAMMER_COMMUNITY_WEBSITE_BASE_URL;
}
