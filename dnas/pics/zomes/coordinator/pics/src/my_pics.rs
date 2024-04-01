use hdk::prelude::*;
use pics_integrity::*;

#[hdk_extern]
pub fn get_my_pics(author: AgentPubKey) -> ExternResult<Vec<Link>> {
    get_links(author, LinkTypes::MyPics, None)
}
