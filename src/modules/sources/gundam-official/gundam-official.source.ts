import { SourceId } from '@entities/subscription.entity';
import { Injectable } from '@nestjs/common';
import { Source } from '@sources/core/abstract-source';
import * as Constants from '@sources/gundam-official/gundam-official.constants';

@Injectable()
export class GundamOfficialSource extends Source {
  public readonly id = SourceId.GundamOfficial;
  public readonly label = Constants.GUNDAM_OFFICIAL_LABEL;
  public readonly description = Constants.GUNDAM_OFFICIAL_DESCRIPTION;
  public readonly url = Constants.GUNDAM_OFFICIAL_WEBSITE_BASE_URL;
}
