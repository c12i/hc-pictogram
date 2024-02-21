use hdk::prelude::*;
use holochain::sweettest::*;

use pics_integrity::*;



pub async fn sample_pic_1(conductor: &SweetConductor, zome: &SweetZome) -> Pic {
    Pic {
	  image: ::fixt::fixt!(EntryHash),
	  story: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
    }
}

pub async fn sample_pic_2(conductor: &SweetConductor, zome: &SweetZome) -> Pic {
    Pic {
	  image: ::fixt::fixt!(EntryHash),
	  story: "Lorem ipsum 2".to_string(),
    }
}

pub async fn create_pic(conductor: &SweetConductor, zome: &SweetZome, pic: Pic) -> Record {
    let record: Record = conductor
        .call(zome, "create_pic", pic)
        .await;
    record
}

