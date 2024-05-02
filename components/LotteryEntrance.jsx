import { useWeb3Contract } from "react-moralis";
import {abi,contractAddresses} from "../contracts";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";



export default function LotteryEntrance(){

   const {chainId:chainIdIdHex,isWeb3Enabled} = useMoralis();
   const chainId = parseInt(chainIdIdHex);
   const raffleAddress = (chainId in contractAddresses)? contractAddresses[chainId][0]:null;
   const [entranceFee,setEntranceFee] = useState("0");
   const [numberPlayers,setNumberPlayers] = useState("0");
   const [recentWinner,setRecentWinner] = useState("0");
   const dispatch = useNotification();

   const {runContractFunction:getEntranceFee}  = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getEntranceFee",
        params:{}
    });


   const {runContractFunction:getNumberOfPalyers}  = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getNumberOfPalyers",
        params:{}
    });

       const {runContractFunction:getRecentWinner}  = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getRecentWinner",
        params:{}
    });


    const {runContractFunction:enterRaffle} = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"enterRaffle",
        msgValue:entranceFee,
        params:{}
    })

    async function updateUI(){
                const entranceFeeResult = (await getEntranceFee()).toString();
                const numberPlayersResult = (await getNumberOfPalyers()).toString();
                const recentWinnerResult = (await getRecentWinner()).toString();
                console.log("fee0--",entranceFeeResult);
                setEntranceFee(entranceFeeResult);
                setNumberPlayers(numberPlayersResult);
                setRecentWinner(recentWinnerResult);
            }

    useEffect(()=>{
        if(isWeb3Enabled){
            updateUI();
        }
    },[isWeb3Enabled]);

    const handleSuccess  = async function(tx){
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    }

    const handleNewNotification =   function(tx){
        dispatch({
            type:"info",
            message:"Transaction Complete!",
            title:"Tx Notification",
            position:"topR",
            icon:"bell"
        })
    }
    
    console.log(">>>>",parseInt(chainIdIdHex));
    return  (  <div>hi from lottery entrance! {
        raffleAddress?(
            <div>
                <button onClick={async function(){
                    await enterRaffle({
                        onSuccess:handleSuccess,
                        onError:(error)=>console.log(error),
                    })
                }}>
                    Enter raffle
                </button>
                {ethers.utils.formatEther(entranceFee)} ETH  <br/>
                Palyers : {numberPlayers} <br/>
                RecenterWinner : {recentWinner} <br/>
                </div>):<div>Not raffle address Deteched</div>}</div>)
  
}