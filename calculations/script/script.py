import sys
import rainflow


def calculate(num):
    numNew = num.split(",")
    temp = []

    for ele in numNew:
        temp.append(float(ele))

    cycles_data = []
    cycles = rainflow.extract_cycles(temp)
    valuerain = rainflow.count_cycles(temp)

    print("cycle", len(cycles), "value rain", valuerain)

    for i in cycles:
        print(i)

    # for rng, mean, count, i_start, i_end in cycles:
    #     print(rng)

    return


if __name__ == "__main__":
    number = sys.argv[1]
    rainflowOutput = calculate(number)

    print(rainflowOutput)
