# Intuitive introduction for attention models
Hi there, in this post, my notes for the "Attention for RNN Seq2Seq models by Shusen Wang" combined with other information from other resources I found on the internet. I put my references at the end.

## Revisiting seq2seq models: why do we need attention

Assuming we want to translate a german sentence (which is our sequence) to english sentence.
A seq2seq model will be composed of our decoder and encoder, each of them is a RNN model.

![Sequence-to-sequence model architecture](images/seq2seq_model.png)

The two sentences can have different lengths. 
The input of the encoder RNN is a set of vectors, each vector is the embedding of a word from the source language (in our case german language).

Each vector $h_i$ is the summary of all the precedents inputs. The final state $h_m$ is a condensed representation of all the input sentence. Ideally, it contains all the needed information for the translation. 

The input of the decoder RNN is the final state of the encoder $h_m$. The decoder network acts a text generator. At each step, it generates a word in the target language. And the generated word becomes the next input $x'_1, \ldots, x'_t$.

We can think of the difference between $x'_t$ and $s_t$: $x'_t$ is what the decoder reads (which during inference time is the generated word) and $s_t$ is what the decoder thinks after reading it.

A symbol here represents a RNN, but it can also be an LSTM or a GRU. LSTM and GRU are some RNN improvements, that was created to improve the memory of RNN, but they are not as efficient as attention models.

The decoder doesn't directly see the source language. 
Shortcoming: the final state of the encoder is incapable of remembering long sequences, because $h_m$ will not have enough capacity to remember long sequences.


That's why we need attention models.


## Attention models

Attention mechanism allows the decoder to know where to look whenever it tries to translate a word.
In simple words, as we will see now, at each step of the translation, it gives for each of the encoders' states a weight depending on the word it's about to translate (depending on the decoder's current state). This weight can be like a similarity function between the current state $s_t$ and all the encoder's hidden states $h_1, \ldots, h_m$, also known as 'align function'. 

In this post, I will not be going into the details of how the align function is calculated.
All the weights of each step add up to 1.

![Calculating weights for $S_0$](images/weights_attention1.png)


Using the weights we calculate a weighted average of them, that leads to a context vector $c$.

![Context vecotr](images/context_vectors.png)
This time, the decoder to calculate a new state vector, instead of using only the new input $x'$ and the previous state, it also uses the context vector of the current step. The context vector is the weighted average of all the hidden state of the encoder, so now the decoder knows where to focus in the encoder to perform the translation task.

$$c_0 = α1 \cdot h_1 + α2 \cdot h_2 + \ldots + αm \cdot h_m$$

Then $s_0$ takes as input the current decoder's input, the previous state $s$ and the previous context vector. 

For example:
$$c_1 = α1 \cdot h_1 + α2 \cdot h_2 + \ldots + αm \cdot h_m$$
$$S_2 = \tanh(A' \cdot [x'_2, s_1, c_1])$$

**Note:** The attention weights (α₁, α₂, ..., αₘ) used to calculate $c_1$ are **not the same** as the attention weights used to calculate $c_0$. I used the same symbols (α) for simplification. However, at each step, **new attention weights** are calculated using the align function between the current decoder state $s_t$ and all the hidden states of the encoder ($h_1$ to $h_m$).

A question to challenge your understanding:
What is the total number of attention weights (α values) we have to compute?

Answer:
At each step we compute $m$ attention weights (α₁, α₂, ..., αₘ), so in total we will have $t \cdot m$ attention weights, where $t$ is the number of decoder steps and $m$ is the number of encoder hidden states.


## References
- https://www.youtube.com/watch?v=B3uws4cLcFw&list=PLgtf4d9zHHO8p_zDKstvqvtkv80jhHxoE
- https://superstudy.guide/transformers-large-language-models/