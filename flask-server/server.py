from flask import Flask,request,json
from flask_cors import CORS,cross_origin
import pandas as pd

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app,support_credentials=True)
@cross_origin(support_credentials=True)
@app.route("/",methods=["POST"])

def funct():
    payLoad = json.loads(request.data)
    df=pd.read_csv("calendar.csv")
    df["date"]=pd.to_datetime(df["date"])
    def categorize_season(date):
        if date.month >= 3 and date.month <= 5:
            return 'Spring'
        elif date.month >= 6 and date.month <= 8:
            return 'Summer'
        elif date.month >= 9 and date.month <= 11:
            return 'Fall'
        else:
            return 'Winter'

    df["Season"] = df["date"].apply(categorize_season)
    df["price"]= df["price"].replace('[$,]','',regex=True).astype("float64")
    new = df.sort_values(by=["Season","date"])
    grouped = new.groupby(by="listing_id")["price"].mean()
    new = new.reset_index().merge(grouped, on='listing_id', suffixes=('', '_group_average')).set_index('index')
    mask = new["price"] < new["price_group_average"]
    new = new[mask]
    dt=new["date"]
    day = pd.Timedelta('1d')
    in_block = ((dt - dt.shift(-1)).abs() == day) | (dt.diff() == day)
    filt = new.loc[in_block]
    breaks = filt["date"].diff()!=day
    groups = breaks.cumsum()
    filt["consecutive"]=groups
    new_group = filt.groupby(["listing_id","consecutive"])
    filtered = [group for name,group in new_group if len(group)>=7]
    new_group = pd.concat(filtered)
    new_group = new_group.groupby(["listing_id"]).head(7)
    mask = new_group["Season"]==payLoad["season"]
    final = new_group[mask].head(35)
    final = final.groupby("consecutive",group_keys=True).apply(lambda x:x)
    final.reset_index(level="index",inplace=True)
    # final_json = final.to_json(orient="index")
    # return final_json
    selected_cols=final[["listing_id","price","date","Season","index"]]
    def row_to_dict(row):
        return {col: row[col] for col in selected_cols.columns}

    # Convert the selected columns to an array of dictionaries
    array_of_dicts = selected_cols.apply(row_to_dict, axis=1).tolist()
    return array_of_dicts

#dropdown API

def season(season):
    print(season)
    return season

if __name__ == "__main__":
    app.run(debug=True)