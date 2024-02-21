#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use hdk::prelude::*;
use holochain::test_utils::consistency_10s;
use holochain::{conductor::config::ConductorConfig, sweettest::*};

mod common;
use common::{create_pic, sample_pic_1};

#[tokio::test(flavor = "multi_thread")]
async fn create_a_pic_and_get_my_pics() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join("../../../workdir/pics.dna");
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("pics", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();
    
    let alice_zome = alice.zome("pics");
    let bob_zome = bobbo.zome("pics");
    
    let sample = sample_pic_1(&conductors[0], &alice_zome).await;
    
    // Alice creates a Pic
    let record: Record = create_pic(&conductors[0], &alice_zome, sample.clone()).await;
    
    consistency_10s([&alice, &bobbo]).await;
    
    let links: Vec<Link> = conductors[1]
        .call(&bob_zome, "get_my_pics", alice_zome.cell_id().agent_pubkey().clone())
        .await;
        
    assert_eq!(links.len(), 1);    
    assert_eq!(links[0].target.clone().into_action_hash().unwrap(), record.signed_action.hashed.hash);
}
