# Demystifying the Leiden Clustering Algorithm: A Personal Inside Look

Hello! I am the **Leiden clustering algorithm** (used for community detection). If you are dealing with large datasets and need fast speed and high scalability, I am the algorithm you are looking for. 

My main job is to identify groups of nodes that are densely connected to each other compared to the rest of the network. I was introduced by Traag et al. from Leiden University in the Netherlands (which is where I get my name!).

Here is a structured transcription of your notes explaining exactly how I work.

## 1. The Optimization Problem

At my core, I am solving an optimization problem. I aim to optimize a specific score, typically **Modularity** or the **Constant Potts Model (CPM)**.

Modularity tries to maximize the difference between the *actual* number of edges in a community and the *expected* number of such edges. It is guided by a **Resolution Parameter**, which acts as a dial: you can tune it to find *more* communities or *fewer* communities.

The score function $H$ can be defined as:
$$H = \frac{1}{2m} \sum_c \left( e_c - \gamma \frac{K_c^2}{2m} \right)$$

* $e_c$: Actual number of edges in community $c$
* $K_c$: Sum of degrees of all nodes in community $c$
* $2m$: Total number of edges in the network
* $\gamma$: Resolution parameter

Optimizing $H$ is an NP-Hard problem. For a long time, the most popular algorithm to optimize this was my predecessor, the **Louvain algorithm**.

## 2. The Predecessor: Louvain's Flaw

To understand me, you must first understand the Louvain algorithm. Louvain operates in two main phases:
1.  **Phase 1 (Local Moving):** It places every node in its own isolated community. It then moves through the network, evaluating the impact of moving each node into a neighboring community. If a move improves the score, it executes it. This continues until there is no further improvement in the score.
2.  **Phase 2 (Aggregation):** Each detected community becomes a single node in a new, aggregate network. 
*These phases are repeated until the score function can no longer be optimized.*

**The Flaw:** Louvain was proven to occasionally lead to arbitrarily badly connected communities. In some cases, the communities it detects might even be *internally disconnected*! This happens because it greedily chases the highest mathematical score without ensuring internal, continuous connectivity.

## 3. How I Work: The Leiden Algorithm

I was designed to be better and faster than classical Louvain, specifically by fixing its fatal flaw. I operate in three distinct phases:

### Phase 1: Local Moving
Similar to Louvain, I start by finding broad communities to optimize the score.

### Phase 2: Refinement (My Secret Sauce)
This is the step that fixes Louvain. 
* **Creating Boundaries:** I take the communities detected in Phase 1 and treat them as strict borders. 
* **Starting Fresh:** Within each of those borders, I detect a new partition by dividing the community back into singleton communities (doing the same thing as Phase 1, but strictly scoped inside each community separately).
* **Randomized Evaluation:** I randomly pick a node and evaluate its local structure.
* **The Random Merge:** If a node has three valid neighbors that would result in score increases of +2, +5, and +1, Louvain's logic would greedily merge with the +5. However, my Phase 2 logic *randomly* picks a node from these 3 options (often as a random choice weighted by the scores, so +5 has a higher probability to be picked, but +2 and +1 are still possible).
* **The Constraints:** * I only merge a selected node if it is well-connected to a neighboring node.
    * **Border Constraint:** I completely ignore any node that is outside the community border detected in Phase 1.
    * I am looking for *any* positive increase in the score function, unlike Phase 1 where I searched for the absolute maximum positive impact.

By randomly evaluating and merging nodes that yield a positive impact, I prevent the algorithm from getting stuck in "local maximums" and mathematically guarantee internally connected sub-communities.

### Phase 3: Aggregation
Once refinement is complete, I shrink the network.
* Each refined sub-community is collapsed into one super-node.
* I calculate the new edge weights by aggregating the local links.
* I then go back to Phase 1 to run the local moving process on these newly weighted nodes.
* **Crucial Difference:** When I go to Phase 1 for the next level, my initial partition is *not* singleton communities. Instead, I initialize using the broad communities found before the refinement step (the original Phase 1 boundaries).

## 4. Visualizing the Levels

*(Insert Screenshot from Page 33 here)*
![Leiden Algorithm Visual Example - Level 1 & 2](placeholder_for_screenshot.png)

Here is how the network transforms through my cycles as depicted in the visual:

**Level 1**
* **a)** Start with singleton communities.
* **b)** Phase of local moving finds broad communities.
* **c)** Refine: Detect a new partition inside each community (splitting them into strictly well-connected sub-communities).

**Level 2**
* **d)** Aggregate: Each refined sub-community is collapsed into one super-node. We then run local moving, initializing the partition using the results of the previous local moving found in step (b).
* **e)** Move nodes in the aggregated network.
* **f)** Refine again.

These steps are repeated until no further improvements can be made.
